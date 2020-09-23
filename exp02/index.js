// 1. Require 'apollo-server'
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default

// scalar types: Int, Float, String, Boolean, ID
const typeDefs = `

    type Image {
        format: String!
        data: String!
        name: String!
        tags: [String!]!
    }
    input ImageInput {
        format: String!
        data: String!
        name: String!
        tags: [String!]!
    }
    type Item {
        id: ID!
        name: String!
        images: [Image!]!
        notes: String
        tags: [String!]!
        eur: Float!
        created: Int
        updated: Int
    }
    input ItemInput {
        name: String!
        images: [ImageInput!]!
        notes: String
        tags: [String!]!
        eur: Float!
    }
    type User {
        id: ID!
        name: String!
        email: String
        notes: String
        created: Int
    }
    input UserInput {
        name: String!
        email: String
        notes: String
    }
    type Sale {
        id: ID!
        user: User!
        items: [Item!]!
        time: Int    
    }
    input SaleInput {
        user_id: ID!
        item_ids: [ID!]!
        time: Int    
    }
    enum SortDirection {
        ASC
        DESC
    }
    enum SortableItemField {
        updated
    }
	type Query {
	    Users: [User!]!
		User(id: ID!): User!
		Sales(user_id: ID!): [Sale!]!
		Sale(id: ID!): Sale!
		Items(
		        tags: [String] 
		        first: Int=20 start: Int=0 
		        sort: SortDirection = DESC
                sortBy: SortableItemField = updated
		    ): [Item!]!
		Item(id: ID!): Item!
	}
	
	type Mutation {
	    postUser ( input: UserInput! ): User!
        postItem ( input: ItemInput! ): Item!
        postSale ( input: SaleInput! ): Sale!
    }
    
    type Subscription {
        newSale: Sale!
    }
    
    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`

var users = [];
var items = [];
var sales = [];
var _id = 0;

const resolvers = {
    Query: {
        Items: (parent, args) => {
            let r = items;
            if(args.tags && 0 < args.tags.length ){
                r = r.filter( o => o.tags.length ===  o.tags.filter( t => args.tags.includes(t)).length );
            }
            if( args.sort && args.sortBy ){
                let sf = (a,b) => {
                    let av = a[args.sortBy.toString()]
                    let bv = a[args.sortBy.toString()]
                    let r = 0;
                    if( av < bv ){
                        r = args.sort === SortDirection.DESC ? 1 : -1;
                    }
                    else {
                        r = args.sort === SortDirection.DESC ? -1 : 1;
                    }
                }
                r.sort(sf);
            }
            if( args.first  && args.start ){
                r = r.slice(Number(args.start), Number(args.start)+Number(args.first));
            }
            return r;
        }
        , Item: (parent, args) => {
            let r = null;
            let f = items.filter(o => o.id === Number(args.id));
            if( 0 < f.length )
                r = f[0];

            return r;
        }
        , Sale: (parent, args) => {
            let r = null;
            let f = sales.filter(o => o.id === Number(args.id));
            if( 0 < f.length )
                r = f[0];

            return r;
        }
        , Sales: (parent, args) => sales.filter(o => o.user.id === Number(args.user_id))
        , User: (parent, args) => {
            let r = null;
            let f = users.filter(o => o.id === args.id);
            if( 0 < f.length )
                r = f[0];

            return r;
        }
        , Users: () => users

    },
    Mutation: {
        postSale(parent, args) {
            console.log("args.input.user_id:",args.input.user_id);
            console.log("typeof args.input.user_id:",typeof args.input.user_id);
            console.log("users:", users);
            console.log("typeof users[0].id:", typeof users[0].id);
            let userFilter = users.filter(o => o.id === Number(args.input.user_id));
            console.log("userFilter:", userFilter);
            if( 0 == userFilter.length )
                throw new Error("can't find user for id:" + args.input.user_id)
            let sale = {
                id: ++_id,
                user: userFilter[0],
                items: items.filter( o =>  args.input.item_ids.includes(o.id) ),
                time: args.input.time
            };
            sales.push(sale);
            return sale;
        },
        postUser(parent, args){

            let user = {
                id: ++_id,
                created: new Date().getTime(),
                ...args.input
            };
            users.push(user);
            return user;
        },
        postItem(parent,args){

            let time = new Date().getTime();
            let images = [];
            args.input.images.forEach( o => images.push({ ...o }));
            console.log("images:",images)
            let item = {
                id: ++_id,
                name: args.input.name,
                images: images,
                notes: args.input.notes,
                tags: args.input.tags,
                eur: args.input.eur,
                created: time,
                updated: time
            };
            items.push(item);
            return item;
        }
    }
}

// 2. Call `express()` to create an Express application
const app = express();
const server = new ApolloServer({
    typeDefs,
    resolvers
});
// 3. Call `applyMiddleware()` to allow middleware mounted on the same path
server.applyMiddleware({ app })

// 4. Create a home route
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.get('/', (req, res) => res.end('Welcome to the exp02 API'))

// 5. Listen on a specific port
app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
)