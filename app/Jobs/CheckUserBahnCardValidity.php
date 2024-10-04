<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\BahnCard;
use Illuminate\Support\Facades\Mail;
use App\Mail\CertificateExpired;
use Carbon\Carbon;

class CheckUserBahnCardValidity implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $expiredBahnCards = \App\Models\BahnCard::whereRaw('DATE_SUB(valid_to, INTERVAL 10 DAY) <= CURDATE()')->with('user')->get();
        foreach ($expiredBahnCards as $bahnCard) {
            Mail::to('sadettin.gokcen@westwind-eisenbahnservice.de')->send(new \App\Mail\CertificateExpired($bahnCard->number, $bahnCard->user->name));
        }
    }
}
