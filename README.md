catan-servers
=============

Backend for a didactic game aimed to teach Node.js.

Description
---------------


Requirements
---------------
The server requires the following software to be installed and working:
- Node 0.10.*
- MongoDB 2.2.4

Server API
---------------


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




Resource Servers SDK
----------------------
