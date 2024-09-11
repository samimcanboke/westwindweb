<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'username',
        'password',
        'extra_info',
    ];

    public function usersPrograms()
    {
        return $this->hasMany(UsersPrograms::class);
    }
}
