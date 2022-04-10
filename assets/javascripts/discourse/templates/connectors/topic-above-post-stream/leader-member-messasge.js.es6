export default ({
    setupComponent(args, component) {
        component.set('isPublicCategory', this.model.allowedCategories.includes(this.model.category_id));
        // console.log('topic-above-post-stream:', this.isPublicCategory);
        window.model = this.model;
        window.app = this;
    },
  });