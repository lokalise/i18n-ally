<?php

class User
{
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public const INTL_DATE_PATTERNS = [
        self::FORMAT_FULL => 'EEEE, MMMM d, y',
        self::FORMAT_LONG => 'MMMM d, y',
        self::FORMAT_MEDIUM => 'MMM d, y',
        self::FORMAT_SHORT => 'M/d/yy',
        self::FORMAT_NONE => '',
    ];
}