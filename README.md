catan-servers
=============

Catan-servers is the backend for a didactic game aimed to teach different communication and process synchronization
technologies. 

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

Requirements
---------------
The server requires the following software to be installed and working:
- Node 0.10.*
- MongoDB 2.2.4

Configuration and installation
---------------------------------
The server's configuration can be found in the config.js file. The default values should be right
for a local installation. This same file contains the server configuration for both the Central Server
and all of the Resource Servers.

The only installation required is to clone this repository. All the servers can be executed from the
repository root.

The Central Server, used to discover other agents of the game, to retrieve the lists of designs and 
to build the houses, can be started with the command:

    node centralServer.js

Each resource server has a separate init file, but the same config. For details on each server, refer
to the server's chapter in this documentation.


Server API
---------------
The API has some operations that can only be used in Edit Mode (setting the config.endpoint.edit
flag to true). The edit mode is intended to debug and design the game server and to setup the
initial data before starting the game. It should be set to false before starting the game. The
operations that are disabled with this flag are marked with the (*) symbol.

* GET /design

Returns a list of the available designs.

* DELETE /design/:id (*)

Delete the design with the id indicated in the URL.

* POST /design (*)

Create a new house design. The design parameters should be passed as a JSON with the new design. The
parameters should be the following:

- name: name of the new house design
- resourcelist: array of resource names representing the resources required to complete this
kind of building.
- value: points granted for constructing each instance of this kind of building.

* GET /house

Gets the list of built houses.

* POST /house

Builds a new house, with the resources passed as a parameter. All the parameters should be passed
as a JSON in the body. The parameters are the following:

- login: Name of the user that will be the owner of the house.
- designId: ID of the design that wants to be used to build the house (will determine what resources
are needed.
- resources: array with the resources needed to build the house. The resources must be valid resources
generated by a Resource Server and should not have been used before in any building.

* GET /resource/server

Gets a list of the available resource servers, along with their URLs and the produced resource.

* GET /resource (*)

Gets a list of the actual resources generated in the server (for debugging purposes only).

* GET /merchant

Returns the list of all the merchants registered in the system.

* POST /merchant

Register a new merchant in the server.


* DELETE /merchant/:id (*)

Unregister the given merchant.


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


Data Model
----------------------
* Resource

* Design

* House

* Resource Server

* Merchant


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

1. When a new Socket.IO connection is received, the server sends blank "¡Hola Don Pepito!" message to the Client.
2. The client replies emitting an "¡Hola Don Jose!" message. This message can be repeated as many times as needed
and each time it is repeated, it resets the internal state for the client to this point in the protocol (use it for
errors, for example).
3. The server replies emiiting a "¿Pasó usted por mi casa?" message, indicating a house address in the payload. 
4. The client has to visit the house in the indicated address, by sending an HTTP POST message to the HTTP endpoint 
of the server with path "/casa" and a payload consisting of a JSON object with a single property "address" with the 
address value provided before. On success, the server will return:

 ```javascript
    {
      message: "Wellcome to the house. This is your certificate.",
      certificate: "a978a90e-bdf2-4cc8-a4b3-54b19e822dbe"
    }
 ```
 
5. The client will emit a "Por su casa yo pasé" message to the server, indicating the certificate in the payload, with 
the following syntax:

 ```javascript
    {
      confirmation: "a978a90e-bdf2-4cc8-a4b3-54b19e822dbe"
    }
 ```

6. The server will check the certificate for validity. If it's correct, it will reply with a "¿Vio usted a mi abuela?"
event, indicating the name of the grandmother in the payload in this way:

 ```javascript
    {
      grandMaName: "49f2c370-262f-4771-bbbb-ae64a0618954"
    }
 ```
 
7. The client will have to visit the specified grandmother in the HTTP endpoint, by posting an HTTP POST message to the
"/abuela" path, with the syntax indicated in the code below. The answer to this request will be a certificate similar 
to the one received in step 4.

 ```javascript
    {
      granMaName: "49f2c370-262f-4771-bbbb-ae64a0618954"
    }
 ```
 
8. The client will issue an "A su abuela yo la vi" message to the server, with the provided message as the payload:

 ```javascript
    {
      grandMaName: "8a87e576-fbe8-4bce-8016-c75f3bd6a7c3"
    }
 ```    

9. The server will answer with an "¡Adios Don Pepito!" message, with the desired resource in the body or an error if
the steel is currently depleted:

 ```javascript
    {
      resource: "5a4c3971-131e-4b19-aa18-0ea562f16b64",
      resourceType: "Metal"
    }
 ```    


10. [Optional] The server will wait for the client to close the connection emitting an "¡Adios Don Jose!". This step
is not required, but it will be rude of you not to follow it (and I'm sure your mother told you to be polite).

### Cement (RabbitMQ)




