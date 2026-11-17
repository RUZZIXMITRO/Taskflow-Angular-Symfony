<?php

namespace App\Security;

/**
 * Jeton signé très simple (HMAC-SHA256) : base64url(payload).base64url(signature).
 * Le payload contient l'identifiant et la date d'expiration.
 * Suffisant pour le projet ; en production on utiliserait un JWT (lexik/jwt-authentication-bundle).
 */
final class TokenService
{
    public function __construct(
        private readonly string $secret,
        private readonly int $ttl = 28800,
    ) {
    }

    public function create(string $username): string
    {
        $payload = self::b64(json_encode(['sub' => $username, 'exp' => time() + $this->ttl], \JSON_THROW_ON_ERROR));

        return $payload.'.'.self::b64(hash_hmac('sha256', $payload, $this->secret, true));
    }

    /** @return string|null identifiant de l'utilisateur, ou null si le jeton est invalide/expiré */
    public function verify(string $token): ?string
    {
        $parts = explode('.', $token);
        if (\count($parts) !== 2) {
            return null;
        }
        [$payload, $signature] = $parts;

        $expected = self::b64(hash_hmac('sha256', $payload, $this->secret, true));
        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $data = json_decode((string) base64_decode(strtr($payload, '-_', '+/'), true), true);
        if (!\is_array($data) || !\is_string($data['sub'] ?? null) || !\is_int($data['exp'] ?? null) || $data['exp'] < time()) {
            return null;
        }

        return $data['sub'];
    }

    private static function b64(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}
