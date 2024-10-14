<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    // Komutun adını tanımlıyoruz
    protected $signature = 'backup:database';

    // Komutun açıklamasını tanımlıyoruz
    protected $description = 'Veritabanı yedeğini alır';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $fileName = 'backup_' . Carbon::now()->format('Y_m_d_H_i_s') . '.sql';

        $dbHost = env('DB_HOST');
        $dbName = env('DB_DATABASE');
        $dbUser = env('DB_USERNAME');
        $dbPassword = env('DB_PASSWORD');

        $command = "mysqldump --user={$dbUser} --password={$dbPassword} --host={$dbHost} {$dbName} > " . storage_path("app/backup/{$fileName}"). " 2>/dev/null";
        $output = null;
        $resultCode = null;
        exec($command, $output, $resultCode);

        if ($resultCode === 0) {
            $this->info("Veritabanı yedeği başarıyla alındı: {$fileName}");
        } else {
            $this->error("Veritabanı yedeği alınırken bir hata oluştu.");
        }
    }
}