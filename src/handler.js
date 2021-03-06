// handler.js

const { nanoid } = require('nanoid')
const fs = require('fs')
const path = require('path')

const notes = []

try {
    const loadNotes = require('./loadNotes.json')
    notes.push(...loadNotes)
} catch (err) {
    // do nothing
}

const saveNotes = () => fs.writeFileSync(path.resolve(__dirname, 'loadNotes.json'), JSON.stringify(notes))

const addNoteHandler = (request, h) => {
    const { title, tags, body } = request.payload

    const id = nanoid(16)
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const newNote = {
        title, tags, body, id, createdAt, updatedAt
    }

    notes.push(newNote)

    const isSuccess = notes.filter(note => note.id === id).length > 0

    if (isSuccess) {
        saveNotes()
        const response = h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data: {
                noteId: id
            }
        })
        response.code(201)
        return response
    }

    const response = h.response({
        status: 'fail',
        message: 'Catatan gagal ditambahkan'
    })
    response.code(500)
    return response
}

const getAllNotesHandler = () => ({
    status: 'success',
    data: {
        notes
    }
})

const getNoteByIdHandler = (request, h) => {
    const { id } = request.params

    const note = notes.filter(note => note.id === id)[0]

    if (note !== undefined) {
        return {
            status: 'success',
            data: { note }
        }
    }

    return h.response({
        status: 'fail',
        message: 'Catatan tidak ditemukan'
    }).code(404)
}

const editNoteByIdHandler = (request, h) => {
    const { id } = request.params

    const { title, tags, body } = request.payload
    const updatedAt = new Date().toISOString()
    const index = notes.findIndex(note => note.id === id)
    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            updatedAt,
            title,
            tags,
            body
        }

        saveNotes()

        return h.response({
            status: 'success',
            message: 'Catatan berhasil diperbarui'
        })
        .code(200)
    }

    return h.response({
        status: 'fail',
        message: 'Gagal memperbarui catatan. Id tidak ditemukan'
    })
    .code(404)
}

const deleteNoteByIdHandler = (request, h) => {
    const { id } = request.params
    const index = notes.findIndex(note => note.id === id)
    if (index !== -1) {
        notes.splice(index, 1)

        saveNotes()

        return h.response({
            status: 'success',
            message: 'Catatan berhasil dihapus'
        })
        .code(200)
    }

    return h.response({
        status: 'fail',
        message: 'Gagal menghapus catatan. Id tidak ditemukan'
    })
    .code(404)
}

module.exports = {
    addNoteHandler,
    getAllNotesHandler,
    getNoteByIdHandler,
    editNoteByIdHandler,
    deleteNoteByIdHandler
}
