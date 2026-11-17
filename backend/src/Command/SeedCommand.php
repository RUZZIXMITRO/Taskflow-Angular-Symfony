<?php

namespace App\Command;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:seed', description: 'Ajoute quelques tâches de démonstration (si la table est vide).')]
final class SeedCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly TaskRepository $repository,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($this->repository->count([]) > 0) {
            $output->writeln('Des tâches existent déjà : rien à faire.');

            return Command::SUCCESS;
        }

        $demo = [
            ['Lire le cours Angular', 'high', '+2 days', false],
            ['Installer le CLI', 'medium', '-3 days', true],
            ['Créer TaskFlow', 'high', '+7 days', false],
            ['Écrire les tests', 'medium', '+10 days', false],
            ['Préparer le build de production', 'low', null, false],
        ];

        foreach ($demo as [$title, $priority, $due, $done]) {
            $this->em->persist((new Task())
                ->setTitle($title)
                ->setPriority($priority)
                ->setCompleted($done)
                ->setDueDate($due ? new \DateTimeImmutable($due) : null));
        }
        $this->em->flush();

        $output->writeln(\count($demo).' tâches de démonstration créées.');

        return Command::SUCCESS;
    }
}
