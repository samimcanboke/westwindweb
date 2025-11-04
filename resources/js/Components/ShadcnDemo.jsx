import React from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';

export default function ShadcnDemo() {
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">shadcn/ui Demo</h1>
            
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>shadcn/ui Başarıyla Kuruldu!</CardTitle>
                    <CardDescription>
                        Artık modern ve güzel UI componentleri kullanabilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="email@example.com" />
                    </div>
                    <div className="flex space-x-2">
                        <Button>Primary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                        <Button variant="secondary">Secondary</Button>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="destructive" size="sm">Sil</Button>
                        <Button variant="ghost" size="sm">İptal</Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="text-sm text-muted-foreground">
                <p>✅ Button componentleri çalışıyor</p>
                <p>✅ Card componentleri çalışıyor</p>
                <p>✅ Input componentleri çalışıyor</p>
                <p>✅ CSS değişkenleri aktif</p>
                <p>✅ Tailwind entegrasyonu tamamlandı</p>
            </div>
        </div>
    );
}