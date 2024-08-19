<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\UserCertificate;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sort',
    ];


    public function userCertificates()
    {
        return $this->hasMany(UserCertificate::class);
    }

}
