/* 
---CREAR RESTful API para autores---

Estructura de un autor:

{
    id: 1,
    nombre: "Jorge Luis",
    apellido: "Borges",
    fechaDeNacimiento: "24/08/1899",
    libros: [
        {
            id: 1,
            titulo: "Ficciones",
            descripcion: "Se trata de uno de sus más...",
            anioPublicacion: 1944
        },
        {
            id: 2,
            titulo: "El Aleph",
            descripcion: "otra recopilación de cuentos...",
            anioPublicacion: 1949
        }
    ]
}


RUTAS / ACCIONES ------
/autores 
-GET: devuelve todos los autores
-POST: crea un nuevo autor

/autores/:id
-GET: devuelve todos los autores con el id indicado
-DELETE: elimina el autor con el id indicado
-PUT: modifica el autor con el id indicado

RUTAS / LIBROS ------
/autores/:id/libros
-GET: devuelve todos los libros de un autor
-POST: agrega un nuevo libro al autor

/autores/:id/libros/:idLibro
-GET: devuelve el libro con el id indicado del autor
-DELETE: elimina el libro con el id indicado del autor
-PUT: modifica el libro con el id indicado del autor


VALIDACIONES -

GET /autores
-Devuelve la lista de autores si hay alguno o array vacio

POST /autores
Si ya existe un autor con mismo nomnre y apellido devuelve 409
De lo contrario agrega un nuevo autor y devuelve 201 con el JSON 
correspondiente del autor.

GET /autores/:id
Si el autor no existe devuelve 404
De lo contrario devuelve 200 con el autor correspondiente

PUT /autores/:id
Si el autor no existe devuelve 404
De lo contrario modifica el autor y devuelve 200 con el autor

DELETE /autores/:id
Si el autor no existe devuelve 404 
De lo contrario elimina el autor y devuelve 204 

GET /autores/:id/libros
Si el autor no existe devuelve 404
Si el autor no tiene ningun libro 200 con array vacio
Caso contrario 200 con lista de libros

POST /autores/:id/libros
Si el autor no existe devuelve 404
De lo contrario agrega el libro al autor y devuelve 201 con el libro agregado

GET /autores/:id/libros/:idLibro
Si el autor no existe devuelve 404
Si el libro no existe devuelve 404
Caso contrario devuelve 200 con el libro correspondiente

PUT /autores/:id/libros/:idLibro
Si el autor no existe devuelve 404
Si el libro no existe devuelve 404
De lo contrario modifica el libro  y devuelve 200 con el libro modificado

DELETE /autores/:id/libros/:idLibro
Si el autor no existe devuelve 404
Si el libro no existe devuelve 404
De lo contrario elimina el libro y devuelve 204

*/

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const data = [
    {
        id: 1,
        nombre: "Jorge Luis",
        apellido: "Borges",
        fechaDeNacimiento: "24/08/1899",
        libros: [
            {
                id: 1,
                titulo: "Ficciones",
                descripcion: "Se trata de uno de sus más...",
                anioPublicacion: 1944
            },
            {
                id: 2,
                titulo: "El Aleph",
                descripcion: "otra recopilación de cuentos...",
                anioPublicacion: 1949
            }
        ]
    }
];

const middlewares = {
    yaExisteElAutor: function(req, res, next) {
        const { nombre, apellido } = req.body;

        const validacion = data.find(a => a.nombre == nombre && a.apellido == apellido);

        if( !validacion ) next();
        res.status(409);
        res.json(`El autor ${nombre} ${apellido} ya existe`)
    },
    yaExisteElLibro: function(req, res, next) {
        const { id } = req.params;
        const { titulo } = req.body;

        const validacion = data.find( a => a.id == id )
                                .libros.find( a => a.titulo == titulo);
        if( !validacion ) next();
        res.status(409);
        res.json(`El libro ${titulo} ya existe`)
    },
    elIdAutorExiste: function(req, res, next) {
        const { id } = req.params;

        const validacion = data.find( a => a.id == id );
        if( validacion ) next();
        res.status(404).send('No se encontró el autor, el id no existe');
    },
    postAutor: function(req, res, next) {
        const { id, nombre, apellido, fechaDeNacimiento, libros } = req.body;

        if ( id && nombre && apellido && fechaDeNacimiento && libros) next();
        res.status(400).send('Faltan datos del autor');
    },
    postLibro: function(req, res, next) {
        const { id, titulo, descripcion, anioPublicacion } = req.body;

        if ( id && titulo && descripcion && anioPublicacion) next();
        res.status(400).send('Faltan datos del libro');
    }

}


//PATH /autores
app.get( '/autores', (req, res) => {
    res.json(data);
});

app.post( '/autores',
    middlewares.postAutor,   
    middlewares.yaExisteElAutor,
    (req, res) => {

        const autorNuevo = req.body;
        data.push(autorNuevo);
        res.status(201);
        res.json(autorNuevo);

    }
);

//PATH /autores/:id
app.get( '/autores/:id', (req, res) => {
    const { id } = req.params;

    let result = data.find( (a) => a.id == id);

    if( result ) res.json(result);
    res.status(404).send('No se encontró el autor, el id no existe');
});

app.put( '/autores/:id', (req, res) => {
    const { id } = req.params;
    const nuevoAutor = req.body;

    let idx = data.findIndex( a => a.id == id);

    if( idx === -1) {
        res.status(404).send('No se encontró el autor, el id no existe');
    } else {
        data.splice( idx, 1, nuevoAutor);
        res.status(200).json(data[idx]);
    }
});

app.delete( '/autores/:id', (req, res) => {
    const { id } = req.params;
    
    let idx = data.findIndex( a => a.id == id);

    if ( idx === -1){
        res.status(404).send('No se encontró el autor, el id no existe');
    } else {
        data.splice(idx, 1);
        res.status(204).send('Autor borrado');
    }
});


//PATH /autores/:id/libros
app.get( '/autores/:id/libros', 
    middlewares.elIdAutorExiste, 
    (req, res) => {
        const {id} = req.params;

        let idx = data.findIndex( a => a.id == id);
        res.json(data[idx].libros);
    }
);

app.post( '/autores/:id/libros', 
    middlewares.elIdAutorExiste,
    middlewares.yaExisteElLibro,
    middlewares.postLibro,
     
    (req, res) => {
        const nuevoLibro = req.body;
        const { id } = req.params;

        let idx = data.findIndex( a => a.id == id);

        data[idx].libros.push( nuevoLibro );
        res.status(201).json(nuevoLibro);
    }
);


//PATH /autores/:id/libros/:idLibro
app.get( '/autores/:id/libros/:idLibro', 
    middlewares.elIdAutorExiste, 
    (req, res) => {
        const { id, idLibro } = req.params;

        const result = data.find( a => a.id == id )
                        .libros.find( a => a.id == idLibro);
        
        if (result) res.json(result);
        res.status(404).send('No se encontró el libro, el id no existe')
    }
);

app.put('/autores/:id/libros/:idLibro',
    middlewares.elIdAutorExiste,
    (req, res) => {
        const { id, idLibro } = req.params;
        const nuevoLibro = req.body;

        let idx;

        let result = data.find( a => a.id == id )
            .libros.filter( (libro, index) => {
                if(libro.id == idLibro) {
                    idx = index;
                    return libro.id == idLibro;
                }
            });
        
        if (result.length === 0) {
            res.status(404).send('No se encontró el libro, el id no existe')   
        } else {
            data[idx].libros.splice( idx, 1, nuevoLibro);
            res.json(nuevoLibro);
        }
        
    }
);

app.delete('/autores/:id/libros/:idLibro',
    middlewares.elIdAutorExiste,
    (req, res) => {
        const { id, idLibro } = req.params;
        let idx;

        let result = data.find( a => a.id == id )
            .libros.filter( (libro, index) => {
                if(libro.id == idLibro) {
                    idx = index;
                    return libro.id == idLibro;
                }
            });
        
        if (result.lenght === 0 ) {
            res.status(404).send('No se encontró el libro, el id no existe')   
        } else {
            data[idx].libros.splice( idx, 1);
            res.status(204).send('Libro borrado');
        }
        
    }
);


app.listen( 3000 ,() =>{
    console.log('Servidor iniciado');
})

