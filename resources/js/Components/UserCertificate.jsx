import React, { useState, useEffect } from 'react'

function UserCertificate({certificates, user, userCertificates}) {

  useEffect(() => {
    console.log(certificates, user, userCertificates)
  }, [])

  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Certificate Adı</th>
            <th className="py-2 px-4 border-b">Oluşturan</th>
            <th className="py-2 px-4 border-b">Onaylayan</th>
            <th className="py-2 px-4 border-b">Sertifika Tarihi</th>
            <th className="py-2 px-4 border-b">Sertifika Geçerlilik Tarihi</th>
            <th className="py-2 px-4 border-b">Görünür mü?</th>
            <th className="py-2 px-4 border-b">Hatırlatma Gün Sayısı</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((certificate, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{certificate.name}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserCertificate
