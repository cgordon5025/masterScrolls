const { User, Campaign, Location } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const resolvers = {
    Query: {
        //this is retrieving the logged in users info
        getUser: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('campaign').populate('location').populate('characters')
            }
            throw new AuthenticationError('you must be logged in!')
        },
        //find a single campaign, irrespective of the user
        getCampaign: async (parent, args) => {
            return Campaign.findById(args.id).populate('location').populate('characters')
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('You have not joined the ranks with these credentials! Please verify your identity or query the council for membership to our guild.')
            }
        },
        createUser: async (parent, { username, email, password }) => {
            return await User.create({ username, email, password }) 
        },
        deleteUser: async (parent, { userId }) => {
            return User.findOneAndDelete({ _id: userId }); 
        }, 
        createCampaign: async (parents, { name, plot }, context) => {
            if (context.user) {
                const newCampaign = await Campaign.create({ name, plot })
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { campaigns: newCampaign._id } }
                )
                return { newCampaign, updatedUser }
            }
        },
        editCampaign: async (parents, { campaignId, name, plot }, context) => {
            if (context.user) {
                const updatedCampaign = await Campaign.findByIdAndUpdate(
                    { _id: campaignId },
                    { $set: { name: name, plot: plot } }
                )
                return updatedCampaign
            }

        },
        deleteCampaign: async (parents, { campaignId }, context) => {
            if (context.user) {
                const deletedCampaign = await Campaign.findByIdAndDelete(
                    { _id: campaignId }
                )
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { campaigns: campaignId } }
                )
                return { deletedCampaign, updatedUser }
            }

        },
        createLocation: async (parents, {locationName, locationDescription}, context) => {
            if (context.user) {
                const newLocation = await Location.create({locationName, locationDescription});
                const updateCampaign = await Campaign.findByIdAndUpdate(
                    { _id: context.user._id},
                    { $push: { location: newLocation._id}}
                )
                return {newLocation, updateCampaign};
            }
        },
        editLocation: async (parent, {locationId, locationName, locationDescription}, context) => {
            if (context.user) {  
                const updateLocation = await Location.findByIdAndUpdate( 
                    { _id: locationId },
                    {
                        $set: { name: locationName, description: locationDescription }
                    },
                )
                return updateLocation
            }
        },
        deleteLocation: async (parents, { locationId }, context) => {
            if (context.user){
                const deleteLocation = await Location.findByIdAndDelete(
                    { _id: context.user._id }
                )
            }
        },
        createCharacter: async () => {

        },
        editCharacter: async () => {

        },
        deleteCharacter: async () => {

        }
    },

};

module.exports = resolvers;