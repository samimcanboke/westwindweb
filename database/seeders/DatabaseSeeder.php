<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'samimcanboke@hotmail.com',
            'email_verified_at' => now(),
            'is_admin' => true,
            'password' => bcrypt('CanseMina2902*-'), // password
        ]);

        Client::factory()->create([
            'name' => 'Lte Niederlande',
        ]);

        Client::factory()->create([
            'name' => 'Westwind Eissenbahnservice',
        ]);
    }
}
