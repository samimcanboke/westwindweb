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
        // Yedeğin kaydedileceği dosya ismi
        $fileName = 'backup_' . Carbon::now()->format('Y_m_d_H_i_s') . '.sql';

        // Veritabanı bağlantı bilgileri
        $dbHost = env('DB_HOST');
        $dbName = env('DB_DATABASE');
        $dbUser = env('DB_USERNAME');
        $dbPassword = env('DB_PASSWORD');

        // mysqldump komutunu çalıştırarak yedek alıyoruz
        $command = "mysqldump --user={$dbUser} --password={$dbPassword} --host={$dbHost} {$dbName} > " . storage_path("app/backup/{$fileName}");

        // Komutu çalıştırıyoruz
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