<?php

namespace App\Security;

use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

/**
 * Appelé par le firewall "api" pour chaque requête qui porte "Authorization: Bearer <jeton>".
 * Jeton invalide ou expiré → 401.
 */
final class ApiTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private readonly TokenService $tokens)
    {
    }

    public function getUserBadgeFrom(#[\SensitiveParameter] string $accessToken): UserBadge
    {
        $username = $this->tokens->verify($accessToken);
        if ($username === null) {
            throw new BadCredentialsException('Jeton invalide ou expiré.');
        }

        // L'utilisateur (et ses rôles) est rechargé depuis le provider "users_in_memory"
        return new UserBadge($username);
    }
}
