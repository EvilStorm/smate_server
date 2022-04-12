var ModelTag = require('../../models/model_tag');
var ModelTagUseMap = require('../../models/model_tag_use_map');
var ModelDress = require('../../models/model_dress');


async function postTags(dressId, userId, tags) {
    if(tags == null) {
        return null;
    }

    var modelDress = await ModelDress.findById(dressId);

    for(var i=0; i<tags.length; i++) {

        var tag = await ModelTag.findOne({tag: tags[i]});
        if(tag == null) {
            tag = ModelTag();
            tag.tag = tags[i];
        }

        tag.count++;
        tag = await tag.save();
        modelDress.tags.push(tag);

        var tagmap = ModelTagUseMap();
        tagmap.dress = dressId;
        tagmap.user = userId;
        tagmap.tag = tag.id;
        tagmap.save()

    }

    let result = modelDress.save();

    return result;
}

module.exports = {
    postTags: postTags
}