## PhoenixJS

Este es un framework basado en [esbuild](https://esbuild.github.io/) para backend, utiliza [ExpressJS](https://expressjs.com/) y [Socket.IO](https://socket.io) para desarrollar servidores HTTP y WebSockets utilizando el modelo MVC con clases para los diferentes módulos del proyecto. Cuenta con un modo dual boot para tener un servidor HTTP y WebSockets en el mismo proyecto, así mismo pudiendo compartir la lógica del servidor (librerías y modelos) entre los controladores de ambos servidores.

### Módulos

#### Configuraciones (config)

El objetivo de éste módulo es procesarla configuración para las librerías y/o servidores (HTTP y WebSockets) la idea es exportar objetos que más adelante se inyectarán en las librerías y en la inicializaión de los servidores HTTP y WebSockets.

#### Librerías (libraries)

En este módulo se exportan funciones que devuelven librerías inicializadas, recibiendo como parámetro el valor de configuración con el mismo nombre que la función. Esto serviría en casos en los que hay que inicalizar conectores con bases de datos, conectores FTP, etc.

#### Modelos (models)

En este módulo se exportan clases que funcionarán como modelos en los que se podran inyectar las instancias de las librerías.

#### Controladores (controllers)

Acá se exportarán los controladores, similar a los modelos, aca se podrán inyectar las instancias de los modelos.

> Ésta pequeña explicación se irá actualizando con el tiempo