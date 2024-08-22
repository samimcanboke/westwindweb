<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\UserCertificate;
use Illuminate\Support\Facades\Mail;
use App\Mail\CertificateExpired;
use Carbon\Carbon;

class CheckUserCertificatesValidity implements ShouldQueue
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

        $expiredCertificates = UserCertificate::whereRaw('DATE_SUB(validity_date, INTERVAL reminder_day DAY) <= CURDATE()')->get();
        foreach ($expiredCertificates as $certificate) {
            //Mail::to($certificate->user->email)->send(new CertificateExpired($certificate->certificate->name, $certificate->user->name));
            Mail::to('sadettin.gokcen@westwind-eisenbahnservice.de')->send(new CertificateExpired($certificate->certificate->name, $certificate->user->name));
        }
    }
}
