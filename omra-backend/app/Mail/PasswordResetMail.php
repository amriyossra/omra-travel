<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $resetLink;
    public $userName;
    public $expiresIn;

    public function __construct($resetLink, $userName = null, $expiresIn = 60)
    {
        $this->resetLink = $resetLink;
        $this->userName = $userName;
        $this->expiresIn = $expiresIn;
    }

    public function build()
    {
        return $this
            ->subject('Réinitialisation de votre mot de passe OmraSmart')
            ->view('emails.password-reset')
            ->with([
                'resetLink' => $this->resetLink,
                'userName' => $this->userName,
                'expiresIn' => $this->expiresIn
            ]);
    }
}
