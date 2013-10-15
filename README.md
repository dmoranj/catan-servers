catan-servers
=============

Catan-servers is the backend for a didactic game aimed to teach different communication and process synchronization
technologies. 

* [Description](#description)
* [Requirements](#requirements)
* [Configuration and installation](#configurationandinstallation)
* [Server API](#serverapi)
* [Command line tool](#commandlinetool)
* [Data Model](#datamodel)
* [Resource Servers SDK](#resourceserversdk)
* [Available Resource Servers](#availableresourceservers)
* [Merchant API](#merchantapi)


<a name="description" />
Description
---------------
Catan Servers is a resource gathering game, where the players have to gather resources in order
to build different types of houses, that will in turn be computed as points. The resources are
server-side entities represented by UUIDs that the players have to retrieve from its corresponding
Resource Server. 

![Alt text](https://raw.github.com/dmoranj/catan-servers/master/img/CatanServersArchitecture.png "Architecture")

Each Resource Server has to be accesed in a different particular way: some servers
should be accessed using HTTP, others using SocketIO, or other protocols... Each time a resource 
server is accessed, a resource UUID is provided. When the player has enough UUIDs of a particular 
resource, he can buy the houses that need this resource. For example: accessing the Wood Server
three times using HTTP will provide three different Wood UUIDS... using this three UUIDs, the player
can connect to the Central Server to buy a Hut (that require 3 Woods to be completed). The resources
used will then be invalidated in the server, so each UUID can only be used once. 

<a name="requirements" />
Requirements
---------------
The server requires the following software to be installed and working:
- Node 0.10.*
- MongoDB 2.2.4
- Redis
- RabbitMQ

<a name="configurationandinstallation" />
Configuration and installation
---------------------------------
The server's configuration can be found in the config.js file. The default values should be right
for a local installation. This same file contains the server configuration for both the Central Server
and all of the Resource Servers.

This project uses [pm2](https://github.com/Unitech/pm2) to launch the CentralServer and all its resource servers.
The prerequisite is to install pm2 globally

```bash
npm install -g pm2
```

After that, execute
```bash
npm install
```
to install all project dependencies

When all is done, simply type
```bash
npm start
```
or
```bash
pm2 start processes.json
```

to start all the needed infrastructure

Please, refer to [pm2 documentation](https://github.com/Unitech/pm2) to learn how to manage
all the processes created

Each resource server has a separate init file, but the same config. For details on each server, refer
to the server's chapter in this documentation.


<a name="serverapi" />
Central Server API
---------------
The API has some operations that can only be used in Edit Mode (setting the config.endpoint.edit
flag to true). The edit mode is intended to debug and design the game server and to setup the
initial data before starting the game. It should be set to false before starting the game. The
operations that are disabled with this flag are marked with the (*) symbol.

#### GET /design

Returns a list of the available designs.

Example response:
 ```javascript
[
  {
    "value": 1,
    "type": "Choza",
    "id": "456d2e3f-3bcf-45b9-9b79-37c7f076c8f6",
    "_id": "5229cc3d83e867291a000001",
    "__v": 0,
    "resources": [
      "Madera",
      "Madera",
      "Madera"
    ]
  },
  {
    "value": 2,
    "type": "Casucha",
    "id": "5cf137a2-6d33-43ee-b90b-5f2d2486d6e5",
    "_id": "523970b793efa2b835000001",
    "__v": 0,
    "resources": [
      "Madera",
      "Piedra"
    ]
  }
]
 ```

#### DELETE /design/:id (*)

Delete the design with the id indicated in the URL.

#### POST /design (*)

Create a new house design. The design parameters should be passed as a JSON with the new design. The
parameters should be the following:

- name: name of the new house design
- resourcelist: array of resource names representing the resources required to complete this
kind of building.
- value: points granted for constructing each instance of this kind of building.

Example request:
 ```javascript
{
    type: "Pisito",
    resources: [ "Madera", "Piedra", "Metal"],
    value: 20
}
 ```
 
Example response:
 ```javascript
{
  "value": 20,
  "type": "Pisito",
  "id": "8dc3add6-50ef-437a-b620-c27fc3691dc6",
  "resources": [
    "Madera",
    "Piedra",
    "Metal"
  ]
}
 ```
 

#### GET /house

Gets the list of built houses.

Example response:
 ```javascript
[
  {
    "designId": "ba439530-9797-402b-9082-38f5392e5798",
    "owner": "dmj",
    "id": "27bbf7fe-f688-4640-80e8-df575e8dfae2",
    "_id": "524d7b145a9f701b11000001",
    "__v": 0
  },
  {
    "designId": "456d2e3f-3bcf-45b9-9b79-37c7f076c8f6",
    "owner": "dmj",
    "id": "dcbe7efb-a9a2-49e4-802e-90ab96ed5812",
    "_id": "524d7b155a9f701b11000002",
    "__v": 0
  }
]
 ```

#### POST /house

Builds a new house, with the resources passed as a parameter. All the parameters should be passed
as a JSON in the body. The parameters are the following:

- login: Name of the user that will be the owner of the house.
- designId: ID of the design that wants to be used to build the house (will determine what resources
are needed.
- resources: array with the resources needed to build the house. The resources must be valid resources
generated by a Resource Server and should not have been used before in any building.

Example request:
 ```javascript
{
    "resources": [
        "9baca2bb-f93f-47ce-9db3-e9a3bce101ce",
        "0251bdd5-35b7-48a6-9afd-41a3bfec5c93",
        "b9927b0d-04cc-4938-bda8-870d68652e8f"
    ],
    "designId": "456d2e3f-3bcf-45b9-9b79-37c7f076c8f6",
    "login": "dmj"
}
 ```

Example response:
 ```javascript
{
    "designId": "456d2e3f-3bcf-45b9-9b79-37c7f076c8f6",
    "owner": "dmj",
    "id": "14e43517-5493-4d02-9b8a-059230c9c621"
}
 ```


#### GET /resource/server

Gets a list of the available resource servers, along with their URLs and the produced resource.

Example response:
 ```javascript
[
  {
    "description": "Simple HTTP server without authentication. Can be mined making a GET request to the '/chop' resource. It provides Madera",
    "url": "http://localhost/3003",
    "resourceName": "Madera",
    "id": "4f5f4f08-8496-4b48-a993-0fcf3b0413e3",
    "_id": "524e861f2960c4fb46000001",
    "__v": 0
  },
  {
    "description": "Socket IO server that provides Metal. To mine it, follow the protocol described in the documentation.",
    "url": "http://localhost/3005",
    "resourceName": "Metal",
    "id": "3582d319-3c09-409c-9bc7-73d9560d8aa5",
    "_id": "524e86234df82f1147000001",
    "__v": 0
  }
]
 ```

#### GET /resource (*)

Gets a list of the actual resources generated in the server (for debugging purposes only).

Example response:
 ```javascript
[
  {
    "name": "Madera",
    "id": "39afc5f5-548e-40fe-8548-3a9e17835047",
    "_id": "524e86232960c4fb46000002"
  },
  {
    "name": "Madera",
    "id": "a1b91c37-9194-4b87-ac13-d7213339a608",
    "_id": "524e86272960c4fb46000003"
  },
  {
    "name": "Metal",
    "id": "25480c7e-9b35-416d-8340-12bb5e7a8556",
    "_id": "524e86284df82f1147000002"
  }
]
 ```

#### GET /merchant

Returns the list of all the merchants registered in the system.

Example response:
 ```javascript
[
  {
    "url": "http://173.31.62.88:5023",
    "name": "dmj",
    "id": "31dc2e62-f63e-443a-a383-04690dc24c02",
    "_id": "524e8b8f69b656784c000001"
  },
  {
    "url": "http://19.231.111.68:5023",
    "name": "rzq",
    "id": "0b8882f3-40a8-4b94-bdc6-84cf7570dd80",
    "_id": "524e8c1669b656784c000002"
  }
]
 ```

#### POST /merchant

Register a new merchant in the server.

Example request:
 ```javascript
{
    "name": "dmj",
    "url": "http://173.31.62.88:5023"
}
 ```

Example response:
 ```javascript
{
  "url": "http://173.31.62.88:5023",
  "name": "dmj",
  "id": "31dc2e62-f63e-443a-a383-04690dc24c02"
}
 ```

#### DELETE /merchant/:id (*)

Unregister the given merchant.


<a name="commandlinetool" />
Command line tool
-------------------
The server has a command line tool, called catanCmd, in order to test and debug features and to prepare the initial
conditions of a game (e.g. creating designs and resources). The followin help output shows the syntax:


    Usage: catanCmd.js <command> [options]

    Commands:

    createDesign [name] [resourceList] [value] 
    
    Use this command to create new designs, indicating the name, value and a comma-separated
    list of the resources needed to build it. Repeat the name of the resource when multiple
     instances of it are to be required
    
    
    createHouse [login] [designId] [resourceList] 
    
    This command buys a new house for the user indicated in the login. The resource used to 
    build the house must exist, and will be deleted as usual once the house is constructed. The resources
    should serialized as a comma-separated list of the resource IDs
    
    
    createServer [resourceName] [url] [description] 
    
    This command register a new Resource Server in the system, to be used in the ResourceServer Directory
    
    
    listHouses             
    
    Return a list of all the created houses
    
    
    listResources          
    
    Return a list of all the available resources
    
    
    listDesigns            
    
    Return a list of all the available designs
    
    
    listResourceServers    
    
    Return a list of all the available Resource Servers
    
    
    removeDesign [id]      
    
    Remove the selected design from the DB
    
    
    removeHouse [id]       
    
    Remove the selected house from the DB
    
    
    removeResource [id]    
    
    Remove the selected resource from the DB
    
    
    removeResourceServer [id] 
    
    Remove the selected Resource Server from the DB
    
    

    Options:

    -h, --help     output usage information
    -V, --version  output the version number


<a name="datamodel" />
Data Model
----------------------
* Resource

* Design

* House

* Resource Server

* Merchant


<a name="resourceserversdk" />
Resource Servers SDK
----------------------
Resource Servers communicate with the central server using the MongoDB database. In order to
ease the programming of the resource servers, they should be provided as new entry points of
this particular project. Thus, all the data access libs inside /lib can be used to both
generate and retrieve resources. To generate new resources, use the resourceService.create()
function. To extract resources from the DB and return them to the users, use the
resourceService.findAndRemove() function, so the retrieval and delete operation is atomic.
Provided you use the existing libs, no more requirements are needed to create a Resource Server;
simply register it in the Resource Server database and all the players shoul be able to use it.


<a name="availableresourceservers" />
Available Resource Servers
---------------------------
### Wood (HTTP)

The resources for this server are granted via HTTP. A HTTP GET request to the /chop path of the 
server will return: an object containing the resource ID 

    {
      name: "Madera",
      id: "d51de2c4-8518-47ab-9a4c-8cc859f5f033"
    }

or an error if there is no wood to chop

    {
      code: "Internal code of the error",
      message: "Error message for human beings"
    }


### Steel (Socket.IO)

The resources of this server have to be negotiated under Socket.IO. The "Clown algorithm" to get them has been summarized
in the following diagram.


This is the detailed description of each of the steps:

1. When a new Socket.IO connection is received, the server sends blank `¡Hola Don Pepito!` message to the Client.
2. The client replies emitting an `¡Hola Don Jose!` message. This message can be repeated as many times as needed
and each time it is repeated, it resets the internal state for the client to this point in the protocol (use it for
errors, for example).
3. The server replies emitting a `¿Paso usted por mi casa?` message, indicating a house address in the payload.
  ```js
  {
    address: "05a096a1-943c-4011-be14-24ceb886f9d9"
  }
  ```

4. The client has to visit the house in the indicated address, by sending an HTTP POST message to the HTTP endpoint 
of the server with path `/casa` and a payload consisting of a JSON object with a single property `address` with the
address value provided before.
  ```js
  {
    address: "05a096a1-943c-4011-be14-24ceb886f9d9"
  }
  ```

On success, the server will return:

 ```javascript
    {
      message: "Welcome to the house. This is your certificate.",
      certificate: "a978a90e-bdf2-4cc8-a4b3-54b19e822dbe"
    }
 ```
 
5. The client will emit a `Por su casa yo pase` message to the server, indicating the certificate in the payload, with
the following syntax:

 ```javascript
    {
      certificate: "a978a90e-bdf2-4cc8-a4b3-54b19e822dbe"
    }
 ```

6. The server will check the certificate for validity. If it's correct, it will reply with a `¿Vio usted a mi abuela?`
event, indicating the name of the grandmother in the payload in this way:

 ```javascript
    {
      grandMaName: "49f2c370-262f-4771-bbbb-ae64a0618954"
    }
 ```
 
7. The client will have to visit the specified grandmother in the HTTP endpoint, by posting an HTTP POST message to the
`/abuela` path, with the syntax indicated in the code below.

 ```javascript
    {
      grandMaName: "49f2c370-262f-4771-bbbb-ae64a0618954"
    }
 ```

The answer to this request will be a certificate similar to the one received in step 4.

  ```js
    {
      message: "Hello sweetie. This is your certificate.",
      certificate: "58bd6f3e-78cc-4d3a-99b0-407cfa42b53e"
    }
  ```


8. The client will issue an `A su abuela yo la vi` message to the server, with the provided message as the payload:

 ```javascript
    {
      certificate: "58bd6f3e-78cc-4d3a-99b0-407cfa42b53e"
    }
 ```    

9. The server will answer with an `¡Adios Don Pepito!` message, with the desired resource in the body or an error if
the steel is currently depleted:

 ```javascript
    {
      resource: "5a4c3971-131e-4b19-aa18-0ea562f16b64",
      resourceType: "Metal"
    }
 ```    


10. [Optional] The server will wait for the client to close the connection emitting an `¡Adios Don Jose!`. This step
is not required, but it will be rude of you not to follow it (and I'm sure your mother told you to be polite).

#### Errors

When an Error happens during a socketIO step, the server will emit an `Error` with the following payload
 ```js
   {
      message: "Blablabla",
      action: "how to solve this error",
      data: {} //OPTIONAL js object with error related data
   }
 ```

When an error happens during an HTTP POST request, the server will respond with a HTTP.`statusCode !== 200`

### Cement (RabbitMQ)

The resources for this server are granted via RabbitMQ.

Clients must subscribe to the config.cementServer.queueName ('cemento' by default) in order to receive cement resource.
Each Cement resource is a JSON object with this format:

    {
      name: "Cemento",
      id: "f89a4e4e-fb8c-480a-923b-8ea50a0d9a75"
    }

If multiple clients are connected to the queue, a Round-Robin alghoritm is used since this is a 'Work Queue'.
See: http://www.rabbitmq.com/getstarted.html & http://www.rabbitmq.com/tutorials/tutorial-two-python.html

### Gold (Merchant API)

The Gold Resource Server is intended to be used for trading goods. It provides the consumer with two different 
resources:

- First, it provides Things of all kinds. To get a Thing, make a request to the /cajondesastre endpoint,
and you will receive a payload with a randomly chosen Thing like the following: 

 ```js
{
  "name": "Suprahipopótamo monádico",
  "id": "dade5029-8761-4ab4-9e00-039c72713755"
}
 ```
 
- It also provide Gold resources, but the gold can only retrieved by paying a specific bill. Making a GET request to 
the /comproOro path, a bill with the price of that specific piece of Gold will be retrieved:

 ```js
{
  "billID": "ebb2f73b-948f-4bd9-84cf-83ce0f3c2d25",
  "price": [
    "Subgranjero ardiente",
    "Microdragón espiritual",
    "Metahippie viscoso",
    "Hipnopapiloma gargantuesco"
  ]
}
 ```
 
To buy the Gold piece, send a POST message with a payload containing the ID's of the retrieved Things and the BillID:

 ```js
{
  "billID": "ffa69478-a930-4e89-abeb-daf8b362081e",
  "resources": [ 
    "987334c8-5ccd-44ac-9de7-1ea70f21f521",
    "7c7d4318-e529-43d9-b55f-b796304b6530",
    "c1954759-5b10-4b04-82c6-583c8189f5ef",
    "b253a789-57d1-48fa-8e98-4a194abb3b05"
  ]
}
 ```
 
If the resources are right, the Gold piece will be collected, and the Gold resource will be retrieved, with a 200 response
code:

 ```js
{
  "name": "Oro",
  "id": "029d4de5-43d9-4ab4-5ccd-9f8185583cef"
}
 ```
 
If there is any problem, a 40x or 50x code will be returned, with a payload with a human readable message indicating the
cause of failure.

NOTE: there is only a copy of each thing so, if there is more than one merchant drawing resources from the server, you
will not be able to retrieve all the Things for yourself; so you better implement the Merchant API to change Things 
with your colleagues.


<a name="merchantapi" />
Merchant API
---------------------------
As a final stage in the development, the developers should implement a Merchant API that will give other developers
access to some mined resources. To achieve this goal, every client should implement the same Merchan API, with the
following features:

* CRUD of catalog items, or resource types the Merchant is willing to sell, indicating the price he expects.
* A buy mechanism, by which any other client willing to make a deal can pay the desired resources to get one of the 
articles.
* A internal mechanism to forbid access to the catalog editing routes for requests other than localhost.

It's worth mentioning that the central server DOES NOT provide any mechanism to verify the authenticity of the traded
goods, so the merchants may want to control who they trust before making a deal. The use of black lists is encouraged
to solve this issue (along with a mechanism to control the origin of goods that are rejected by the central server).

To enable the merchants to find themselves, the central server provides a Market API, where the merchants can register
and list all the already registered Merchants.

The following sections explain the API with more detail.

#### Error Messages
All error messages will be reported with a JSON body specifing the nature of the problem. The scheme of that body
will be the following:

 ```javascript
{
    code: 4501,
    message: "The types of the resources didn't match the resource price"
}
 ```

The code should be an internal code for that particular type of error. The message is meant to be a human-readable 
message, so it doesn't need to have any particular syntax.

#### GET /catalog
Retrieve the list of all catalog items and their prices.

 ```javascript
[
    {
        id: "570ba3a5-b24b-4a7f-4a7f-f8e6d70ba615",
        price: ["Madera", "Madera", "Piedra"],
        type: "Circonio"
    },
    {
        id: "2e1624a5-7f7b-fcfc-83fc-f8e8570babb5",
        price: ["Rubi", "Circonio", "Plata"],
        type: "Talco"
    },
    {
        id: "17a52cb2-67ec-42d8-a904-b0fc2e657d80",
        price: ["Piedra", "Papel", "Tijera"],
        type: "Rubi"
    }
]
 ```

#### GET /catalog/:id
Retrieve the specificied catalog Item, indicating how much stock there is for that item.

 ```javascript
{
    price: ["Madera", "Madera", "Piedra"],
    type: "Circonio",
    stock: 12
}
 ```

#### POST /catalog/:id/buy
Buy one item of the catalog. The buyer must include the UUIDs and types of the products in the payload:

 ```javascript
{
    bill: [
        {
            type: "Madera",
            value: "570ba3a5-b24b-4a7f-4a7f-f8e6d70ba615"
        },
        {
            type: "Piedra",
            value: "2e1624a5-7f7b-fcfc-83fc-f8e8570babb5"
        }
    ]
}
 ```

If the payload is incorrect, the Merchant will reply with a status code 400 and an error message indicating what was
the nature of the problem (see format above).

If the payload is correct, and there is enough stock of the traded good, the merchant will reply with the product and 
a 200 OK status:

 ```javascript
{
  type: "Plutonio",
  value: "17a52cb2-67ec-42d8-a904-b0fc2e657d80"
}
 ```

#### POST /catalog
Creates a new entry in the catalog, indicating the type of resource it is going to be traded and the amount and type
of other resources needed to perform a transaction. The body of the request should be like the following:

 ```javascript
{
    price: ["Madera", "Madera", "Piedra"],
    type: "Circonio"
}
 ```

If the new resource is created, a 200OK message will be returned.


#### DELETE /catalog/:id
Remove the specified entry from the catalog. It doesn't expect a body. If everything went well, it will return a 200OK
with a valid JSON body. If the catalog item could not be found, a 404Not Found code will be returned. 






