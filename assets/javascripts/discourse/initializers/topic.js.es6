import { withPluginApi } from 'discourse/lib/plugin-api';
import discourseComputed from "discourse-common/utils/decorators";

function initializeTestPlugin(api){
 
  let currentUser = Discourse.User ?  Discourse.User.current() : false;
  let allowedCategories = [5];
 
  api.modifyClass("component:topic-category", {
    pluginId: 'test-category',
    init(){
      this._super(...arguments);
      window.currentCategory = this.topic.category_id;
    }
  });

   api.modifyClass("model:topic", {
      pluginId: 'test-model',
      init(){
        this._super(...arguments);
        this.isPublicCategory = allowedCategories.includes(this.category_id);
      }
   });

  api.modifyClass("controller:topic", {
    pluginId: 'test-plugin',
    init(){
      this._super(...arguments);
      if (this.currentUser){
         this.currentUser.canViewAnswers = userCanViewAnswers(this.currentUser);
      }
    },
    @discourseComputed(
        "model.postStream.posts",
        "model.postStream.postsWithPlaceholders"
      )
    postsToRender(posts,postsWithPlaceholders){
      return (this.currentUser &&  this.currentUser.canViewAnswers) || allowedCategories.includes(window.currentCategory)
      ? (this.capabilities.isAndroid ? 
        posts : postsWithPlaceholders) 
      : (this.capabilities.isAndroid ? posts.slice(0, 1) : postsWithPlaceholders.slice(0, 1));
    },
    
  });

  api.modifyClass("component:topic-navigation", {
    pluginId: 'test-navigations',
    init(){
      this._super(...arguments);
      if(!userCanViewAnswers(currentUser) && !allowedCategories.includes(window.currentCategory)){
        this.set("canRender", false);
      }
    }
  });
}

function userCanViewAnswers(user=false){
    if(!user){
      return;
    }
    let user_groups = user.groups.map(g => g.name);
    return user_groups.includes('privileged') || user.admin || user.moderator;
}

export default {
  name: 'test-plugin',
  initialize() {
     withPluginApi('0.1', initializeTestPlugin);
  }
}

