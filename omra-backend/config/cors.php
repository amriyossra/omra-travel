<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:8100',  // Angular développement
        'http://localhost:4200',  // Angular développement alternatif
        'http://localhost:8000',  // Laravel
        'http://127.0.0.1:8100',  // Angular avec IP
        'http://127.0.0.1:4200',  // Angular alternatif
        'http://127.0.0.1:8000',  // Laravel avec IP
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
