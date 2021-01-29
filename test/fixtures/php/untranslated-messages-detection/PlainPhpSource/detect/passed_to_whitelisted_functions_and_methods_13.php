<?php

namespace App\Controller;


class HardcodedStringsController extends AbstractController
{
    public function index(RequestEvent $event, TranslatorInterface $translator): Response
    {
        Artisan::command('this should not be highlighted', function () {
            $this->comment(Inspiring::quote());
        })->purpose('This should be highlighted');

        $this->respond('POST', '/mass-action', function () {
            return "this also should be highlighted";
        });

        $exception = new Exception('The username must contain only lowercase latin characters and underscores.');

        $this->error('This command requires to have the "sqlite3" PHP extension enabled because, by default, the Symfony Demo application uses SQLite to store its information.');

        $this
            ->setDescription('Creates users and stores them in the database')
            ->setHelp($this->getCommandHelp())
            ->addArgument('username', InputArgument::OPTIONAL, 'The username of the new user');

        sprintf('There are %d monkeys', $price);

        $params = $app->validator
            ->setErrorMessage('Request body is not a valid JSON')->isJson()->parseJson()
            ->hasKey('name')->navigateToKey('name')
            ->notEmpty()->isString()
            ->setErrorMessage('Branch name too short')->isMinLen(2)
            ->navigateBack()
            ->getArray();

        $this->createNotFoundException('Background process not found');

        $this
            ->setDescription('Creates users and stores them in the database')
            ->setHelp($this->getCommandHelp())
            // commands can optionally define arguments and/or options (mandatory and optional)
            // see https://symfony.com/doc/current/components/console/console_arguments.html
            ->addArgument('username', InputArgument::OPTIONAL, 'The username of the new user');


        $app->controller->apiError('Feature is not enabled in the current team plan.', ApiManager::HTTP_STATUS_BAD_REQUEST);

        return $this->response();
    }
}
