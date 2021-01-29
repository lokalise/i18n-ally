<?php
$this->table('comments');

$this->respond('POST', '/mass-action', function () {});

$this->createQueryBuilder('p')
    ->addSelect('a', 't')
    ->innerJoin('p.author', 'a')
    ->leftJoin('p.tags', 't')
    ->where('p.publishedAt <= :now')
    ->orderBy('p.publishedAt', 'DESC')
    ->setParameter('now', new \DateTime());

$names = array_filter(array_unique(array_map('strip_tags', $this->createQueryBuilder('p'))));
