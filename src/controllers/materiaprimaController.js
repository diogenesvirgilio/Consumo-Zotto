import {
         getMateriaprima,
         getMateriaprimaById,
         createMateriaprima,
         updateMateriaprima,
         deleteMateriaprima
} from "../models/materiaprimaModel.js"; 

export async function listMateriasprima(req, res) {
    try {
        const materiaprima = await getMateriaprima();
        res.json(materiaprima);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
} 

export async function findMateriaprima(req, res) {
    try {
        const { id } = req.params;
        const materiaprima = await getMateriaprimaById(id);
        if (!materiaprima) {
            return res.status(404).json({ message: "Matéria prima não encontrado" });
        } 
        res.json(materiaprima);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function registerMateriaprima(req, res) {
    try {
        const { nome } = req.body;
        const newMateriaprima = await createMateriaprima(nome);
        res.status(201).json(newMateriaprima);
    } catch (err) {
        res.status(201).json({ error: err.message });
    }
} 

export async function handleUpdateMateriaprima(req, res) {
    try {
        const { id } = req.params;
        const { nome } = req.body;
        const materiaprimaAtualizada = await updateMateriaprima(id, nome);
        if (!materiaprimaAtualizada) {
            return res.status(404).json({ message: "Materia Prima não encontrada" });
        }
        res.json(materiaprimaAtualizada);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
} 

export async function removeMateriaprima(req, res) {
    try {
        const { id } = req.params;
        await deleteMateriaprima(id);
        res.json({ message: "Matéria Prima removida com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}