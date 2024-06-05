<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    public function draftJobs()
    {
        return $this->hasMany(DraftJob::class);
    }

    public function finalizedJobs()
    {
        return $this->hasMany(finalizedJobs::class);
    }
}
