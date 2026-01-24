"use client"
import { getAppMembers, uploadMembersCsv } from "@/lib/api/members"
import { useEffect, useState, useRef } from "react"
import { membership, user } from "@/types/entities"

export default function Members() {
    const [members, setMembers] = useState<(membership & { user: user })[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)

    const fetchMembers = () => {
        getAppMembers()
            .then(data => {
                if (Array.isArray(data)) {
                    setMembers(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            await uploadMembersCsv(file)
            alert('Miembros actualizados correctamente')
            fetchMembers()
        } catch (error) {
            console.error(error)
            alert('Error al subir el archivo')
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }
    
    return (
        <>
        {loading ? (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        ) : (
        <div className="p-6">
            <div className="flex flex-row gap-4 items-center mb-4">
                <h1 className="text-2xl font-bold">Miembros</h1>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Subir CSV
                </button>
            </div>
            
            <div className="bg-gray-100 p-4 mb-4 rounded border">
                <p><strong>Información:</strong></p>
                <p>Cantidad de miembros: {members.length}</p>
                <p>Cantidad de miembros activos: {members.filter((member) => member.status === 'active').length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <button onClick={() => window.location.href = `/members/${member.id}`} key={member.id} className="flex flex-row items-center justify-between p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:scale-105 transition-all text-left">
                        <div className="flex flex-col gap-1">
                            <h1 className="font-bold text-lg">{member.user?.name || 'Sin Nombre'}</h1>
                            <p className="text-sm text-gray-600">{member.user?.email || 'Sin Email'}</p>
                            {member.user?.dni && <p className="text-xs text-gray-500">DNI: {member.user.dni}</p>}
                            {member.user?.phone && <p className="text-xs text-gray-500">Tel: {member.user.phone}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {member.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Desde: {new Date(member.starts_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">Hasta: {member.ends_at ? new Date(member.ends_at).toLocaleDateString() : '-'}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        )}
        </>
    )
}