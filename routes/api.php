<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Http\Controllers\Api\JobPlansController;
use App\Http\Middleware\JWTAuthentication;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NewJobController;
use App\Http\Controllers\Api\LocationsController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\FileUploadController;

Route::middleware([JWTAuthentication::class])->group(function () {
    
    Route::group(['prefix' => 'user'], function () {
        Route::get('/', [RegisteredUserController::class, 'show']);
        Route::get('/all', [RegisteredUserController::class, 'api_all']);
        Route::post('/', [RegisteredUserController::class, 'store']);
        Route::put('/{id}', [RegisteredUserController::class, 'update']);
        Route::delete('/{id}', [RegisteredUserController::class, 'destroy']);
    });

    Route::group(['prefix' => 'clients'], function () {
        Route::get('/', [ClientsController::class, 'index']);
    });

    Route::group(['prefix' => 'profile'], function () {
        Route::get('/', [ProfileController::class, 'index']);
    });
    
    Route::post('/refresh', [JWTAuthController::class, 'refresh']); 
    Route::post('/logout', [JWTAuthController::class, 'logout']);

    Route::group(['prefix' => 'plans'], function () {
        Route::get('/', [JobPlansController::class, 'index']);  
        Route::get('/{id}', [JobPlansController::class, 'show']);
    });

    Route::group(['prefix' => 'jobs'], function () {
        Route::get('/', [NewJobController::class, 'index']);
        Route::post('/', [NewJobController::class, 'save']);
        Route::put('/{id}', [NewJobController::class, 'update']);
        Route::delete('/{id}', [NewJobController::class, 'destroy']);
    });
    Route::group(['prefix' => 'locations'], function () {
        Route::get('/stations', action: [LocationsController::class, 'stations']);
        Route::get('/', action: [LocationsController::class, 'index']);
        Route::post('/{tour_id}', action: [LocationsController::class, 'store']);
    });

    Route::group(['prefix' => 'files'], function () {
        Route::post('/upload', [FileUploadController::class, 'upload']);
    });
});

Route::post('/login', [JWTAuthController::class, 'login'])->withoutMiddleware(JWTAuthentication::class);
Route::post('/verify', [JWTAuthController::class, 'verify'])->withoutMiddleware(JWTAuthentication::class);