"use client"
import { getGymMachineTemplate } from "@/lib/api/machines"
import { useEffect, useState } from "react"
import { machineTemplate } from "@/types/entities"

import { useParams } from "next/navigation"

export default function Machine() {
    const params = useParams()
    const id = params.id as string
    const [machineTemplate, setMachineTemplate] = useState<machineTemplate>()

    useEffect(() => {
        if (!id) return
        getGymMachineTemplate(id)
            .then(data => {
                // The API now returns the equipment with machine_template included
                setMachineTemplate(data as any) // Using any to match the setMachineTemplate type state which expected just machineTemplate but we have more
            })
            .catch(console.error)
    }, [id])
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Equipamiento</h1>
            
            <div className="bg-gray-100 p-4 mb-4 rounded border">
                <p><strong>Info:</strong></p>
                <p>Categoria: {(machineTemplate as any)?.machine_template?.category}</p>
                <p>Nombre: {(machineTemplate as any)?.machine_template?.name}</p>
                <p>Descripción: {(machineTemplate as any)?.machine_template?.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <img src={(machineTemplate as any)?.machine_template?.imageUrl} alt={(machineTemplate as any)?.machine_template?.name} />
            </div>
        </div>
    )
}