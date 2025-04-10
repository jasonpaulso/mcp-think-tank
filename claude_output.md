What MCP tools do you have available?

I have access to several knowledge graph tools that allow me to create, read, update, and delete information in a Multi-Concept Processing (MCP) system. These tools include:

Creating entities and relations
create_entities - Add new entities to the knowledge graph
create_relations - Add new relationships between entities
Reading and searching
read_graph - View the entire knowledge graph
search_nodes - Find specific nodes based on queries
open_nodes - View specific nodes by name
Updating information
add_observations - Add details to existing entities
update_entities - Change existing entity information
update_relations - Modify existing relationships
Deleting information
delete_entities - Remove entities from the graph
delete_observations - Remove specific observations from entities
delete_relations - Remove relationships between entities
I also have a structured thinking tool that helps with complex reasoning tasks and an artifacts tool for creating visual or code-based content. Additionally, I have an analysis tool (JavaScript REPL) for processing data and executing code.

Would you like me to demonstrate how any of these tools work?

"Science fiction thriller","Features dreams within dreams"]},{"name":"Christopher Nolan","entityType":"Director","observations":["British-American filmmaker","Known for complex narratives","Born in 1970"]},{"name":"Leonardo DiCaprio","entityType":"Actor","observations":["American actor","Academy Award winner","Born in 1974"]}],"relations":[{"from":"Christopher Nolan","to":"Inception","relationType":"directed"},{"from":"Leonardo DiCaprio","to":"Inception","relationType":"acted in"}]}
Let's use the search_nodes function to find information about a specific entity:


View result from search_nodes from think-memory (local)



{
  `query`: `Leonardo`
}
{"entities":[{"name":"Leonardo DiCaprio","entityType":"Actor","observations":["American actor","Academy Award winner","Born in 1974"]}],"count":1,"message":"Found 1 matching entities."}
Now let's add some additional observations to the "Inception" entity:


View result from add_observations from think-memory (local)



{
  `observations`: [
    {
      `contents`: [
        `Budget of $160 million`,
        `Grossed over $800 million worldwide`
      ],
      `entityName`: `Inception`
    }
  ]
}
{"updated":[{"entityName":"Inception","added":["Budget of $160 million","Grossed over $800 million worldwide"]}],"failed":null,"message":"Added observations to 1 entities. Failed for 0 entities."}
Finally, let's update the "Leonardo DiCaprio" entity with some modified information:


View result from update_entities from think-memory (local)



{
  `entities`: [
    {
      `name`: `Leonardo DiCaprio`,
      `entityType`: `Actor`,
      `observations`: [
        `American actor`,
        `Academy Award winner for The Revenant`,
        `Born in 1974`,
        `Environmental activist`
      ]
    }
  ]
}
{"updated":["Leonardo DiCaprio"],"notFound":null,"message":"Updated 1 entities. 0 entities not found."}
Let's check the updated entity:


View result from open_nodes from think-memory (local)



{
  `names`: [
    `Leonardo DiCaprio`
  ]
}
{"entities":[{"name":"Leonardo DiCaprio","entityType":"Actor","observations":["American actor","Academy Award winner for The Revenant","Born in 1974","Environmental activist"]}],"found":["Leonardo DiCaprio"],"notFound":null,"message":"Found 1 entities. 0 entities not found."}
That completes the demonstration of the core MCP tools! As you can see, I've:

Created entities (movies, directors, actors)
Established relationships between them
Viewed the complete knowledge graph
Searched for specific information
Added new observations to existing entities
Updated entity information with more details
These tools allow for creating and managing complex knowledge bases that represent relationships between different concepts. The knowledge graph structure makes it particularly useful for storing connected information that can be queried and manipulated in various ways.

Would you like to see a demonstration of any of the other tools, such as deleting information or using the analysis tool for data processing?