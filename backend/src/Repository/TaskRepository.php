<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /** @return Task[] tâches non terminées d'abord, puis par date limite */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('t')
            ->orderBy('t.completed', 'ASC')
            ->addOrderBy('t.dueDate', 'ASC')
            ->addOrderBy('t.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return array{total:int, completed:int, overdue:int, byPriority:array{low:int, medium:int, high:int}} */
    public function stats(): array
    {
        $tasks = $this->findAll();
        $today = new \DateTimeImmutable('today');
        $stats = ['total' => \count($tasks), 'completed' => 0, 'overdue' => 0, 'byPriority' => ['low' => 0, 'medium' => 0, 'high' => 0]];

        foreach ($tasks as $task) {
            if ($task->isCompleted()) {
                ++$stats['completed'];
            } elseif ($task->getDueDate() !== null && $task->getDueDate() < $today) {
                ++$stats['overdue'];
            }
            ++$stats['byPriority'][$task->getPriority()];
        }

        return $stats;
    }
}
