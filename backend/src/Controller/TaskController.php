<?php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Contrat d'API :
 *  GET    /api/tasks        → 200 Task[]
 *  GET    /api/tasks/{id}   → 200 Task · 404
 *  POST   /api/tasks        → 201 Task · 422
 *  PATCH  /api/tasks/{id}   → 200 Task · 404 · 422
 *  DELETE /api/tasks/{id}   → 204 · 404
 */
#[Route('/api/tasks')]
final class TaskController extends AbstractController
{
    public function __construct(
        private readonly TaskRepository $repository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'task_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(fn (Task $t) => $t->toArray(), $this->repository->findAllOrdered()));
    }

    #[Route('/{id<\d+>}', name: 'task_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $task = $this->repository->find($id);

        return $task ? $this->json($task->toArray()) : $this->notFound($id);
    }

    #[Route('', name: 'task_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $task = new Task();
        $errors = $this->hydrate($task, $request, requireTitle: true);
        if ($errors) {
            return $this->unprocessable($errors);
        }

        $this->em->persist($task);
        $this->em->flush();

        return $this->json($task->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id<\d+>}', name: 'task_update', methods: ['PATCH', 'PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->repository->find($id);
        if (!$task) {
            return $this->notFound($id);
        }

        $errors = $this->hydrate($task, $request, requireTitle: false);
        if ($errors) {
            $this->em->refresh($task); // annule les modifications invalides

            return $this->unprocessable($errors);
        }

        $this->em->flush();

        return $this->json($task->toArray());
    }

    #[Route('/{id<\d+>}', name: 'task_delete', methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $task = $this->repository->find($id);
        if (!$task) {
            return $this->notFound($id);
        }

        $this->em->remove($task);
        $this->em->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Applique le JSON reçu sur l'entité puis la valide.
     * Le serveur revalide toujours : la validation Angular n'est qu'un confort.
     *
     * @return array<string, string> erreurs par champ (vide si tout est valide)
     */
    private function hydrate(Task $task, Request $request, bool $requireTitle): array
    {
        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            return ['body' => 'Le corps de la requête doit être un JSON valide.'];
        }

        $errors = [];

        if (\array_key_exists('title', $data) || $requireTitle) {
            if (!\is_string($data['title'] ?? null)) {
                $errors['title'] = 'Le titre est obligatoire.';
            } else {
                $task->setTitle($data['title']);
            }
        }
        if (\array_key_exists('description', $data)) {
            if ($data['description'] !== null && !\is_string($data['description'])) {
                $errors['description'] = 'La description doit être un texte.';
            } else {
                $task->setDescription($data['description']);
            }
        }
        if (\array_key_exists('completed', $data)) {
            if (!\is_bool($data['completed'])) {
                $errors['completed'] = 'completed doit être un booléen.';
            } else {
                $task->setCompleted($data['completed']);
            }
        }
        if (\array_key_exists('priority', $data)) {
            if (!\is_string($data['priority'])) {
                $errors['priority'] = 'La priorité doit être low, medium ou high.';
            } else {
                $task->setPriority($data['priority']);
            }
        }
        if (\array_key_exists('dueDate', $data)) {
            $raw = $data['dueDate'];
            if ($raw === null || $raw === '') {
                $task->setDueDate(null);
            } else {
                $date = \is_string($raw) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $raw) : false;
                if (!$date || $date->format('Y-m-d') !== $raw) {
                    $errors['dueDate'] = 'La date limite doit être au format AAAA-MM-JJ.';
                } else {
                    $task->setDueDate($date);
                }
            }
        }

        foreach ($this->validator->validate($task) as $violation) {
            $errors[$violation->getPropertyPath()] ??= (string) $violation->getMessage();
        }

        return $errors;
    }

    private function notFound(int $id): JsonResponse
    {
        return $this->json(['error' => "Tâche $id introuvable."], Response::HTTP_NOT_FOUND);
    }

    /** @param array<string, string> $errors */
    private function unprocessable(array $errors): JsonResponse
    {
        return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
