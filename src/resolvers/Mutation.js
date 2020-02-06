
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')


function post(parent, args, context, info) {
  const userId = getUserId(context)
  return context.prisma.createLink({
    url: args.url,
    description: args.description,
    postedBy: { connect: { id: userId } },
  })
}


async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.createUser({ ...args, password })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}



async function login(parent, args, ctx, info){


   const user = await ctx.prisma.user({email: args.email})

    if(!user){
     throw new Error("No such user found")
      }

    const valid = await bcrypt.compare(args.password, user.password)

       if(!valid){
            throw new Error("Invalide password")
     }


    const token = jwt.sign({ userId:user.id }, APP_SECRET)

   return {
      token, 
      user,
    }

}


//vote function
async function vote(parent, args, ctx, info) {
    const userId = getUserId(ctx);

    const linkExists = await ctx.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.linkId },
    })
    if (linkExists) {
        throw new Error(`Already voted for link: ${args.linkId}`)
    }

    return ctx.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId} },
    })
}



module.exports = {
    post,
    signup, 
    login,
    vote,

}