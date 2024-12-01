<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Http\Controllers\Api\JobPlansController;
use App\Http\Middleware\JWTAuthentication;

Route::middleware([JWTAuthentication::class])->group(function () {
    
    Route::group(['prefix' => 'user'], function () {
        Route::get('/', [RegisteredUserController::class, 'show']);
        Route::post('/', [RegisteredUserController::class, 'store']);
        Route::put('/{id}', [RegisteredUserController::class, 'update']);
        Route::delete('/{id}', [RegisteredUserController::class, 'destroy']);
    });
    
    Route::post('/refresh', [JWTAuthController::class, 'refresh']); 
    Route::post('/logout', [JWTAuthController::class, 'logout']);

    Route::group(['prefix' => 'plans'], function () {
        Route::get('/', [JobPlansController::class, 'index']);  
        Route::get('/{id}', [JobPlansController::class, 'show']);
    });
});

Route::post('/login', [JWTAuthController::class, 'login'])->withoutMiddleware(JWTAuthentication::class);
Route::post('/verify', [JWTAuthController::class, 'verify'])->withoutMiddleware(JWTAuthentication::class);
