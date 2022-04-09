export default ({
    setupComponent(args, component) {
        component.set('isPublicCategory', this.model.allowedCategories.includes(this.model.category_id));
        // console.log('topic-title:', this.isPublicCategory);
    },
  });