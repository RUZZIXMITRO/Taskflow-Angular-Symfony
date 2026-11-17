<?php

namespace App\Controller;

use App\Repository\TaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Protégé deux fois côté serveur : access_control (^/api/admin) + #[IsGranted].
 * Sans jeton → 401 ; jeton d'un simple utilisateur → 403.
 */
#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
final class AdminController extends AbstractController
{
    #[Route('/stats', name: 'admin_stats', methods: ['GET'])]
    public function stats(TaskRepository $repository): JsonResponse
    {
        return $this->json($repository->stats());
    }
}
