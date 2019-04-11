# Coffee Chats 2.0
> Zulip bot that pairs Recursers for coffee chats

## Signing up  
If you're looking to get paired for coffeechats you can subscribe to the coffee chat stream.

## Background
The original prototype began during Sheridan's batch in fall 2018. The original project can be found on glitch [here](https://glitch.com/~zulip-coffee-bot).

The current goal has now been to make Coffee Chat more robust so it can be easily maintained and others can all contributions without worrying about breaking this microservice. These goals include the following:
* decoupling the code into separate modules
* writing tests to ensure there are no regression bugs
* Using TypeScript for type safety and documentation

## Add Features
* CLI for interacting with coffee chat bot (easily extensible)

#### Next Steps:
- [ ] Fix & write tests for all the CLI actions & database queries
- [ ] migrate current data to the new prod.db && deactivate the glitch server
- [ ] TypeScriptify the project (set to strict compiler settings)

### Code Refactors:
- [] add the db into the context of each of the action handler functions. Easier to test!


### Contributors
* Alan Chu - releasing the second version 
* Sheridan Kates - started the project 
* Liz Krane
* Greg Altman
* Jordan & Maren --> for getting me to update the readme :) 