<?php

namespace App\Controller;

use App\Security\TokenService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

final class AuthController extends AbstractController
{
    /** POST /api/login {username, password} → 200 {token, user} · 401 */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        #[Autowire(service: 'security.user.provider.concrete.users_in_memory')] UserProviderInterface $users,
        UserPasswordHasherInterface $hasher,
        TokenService $tokens,
    ): JsonResponse {
        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            $data = [];
        }
        $username = \is_string($data['username'] ?? null) ? $data['username'] : '';
        $password = \is_string($data['password'] ?? null) ? $data['password'] : '';

        try {
            $user = $username !== '' ? $users->loadUserByIdentifier($username) : null;
        } catch (UserNotFoundException) {
            $user = null;
        }

        if (!$user instanceof PasswordAuthenticatedUserInterface || !$hasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'token' => $tokens->create($user->getUserIdentifier()),
            'user' => ['username' => $user->getUserIdentifier(), 'roles' => $user->getRoles()],
        ]);
    }
}
