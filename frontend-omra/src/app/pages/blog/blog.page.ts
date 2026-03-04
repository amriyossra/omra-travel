import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.page.html',
  styleUrls: ['./blog.page.scss'],
  standalone: false
})
export class BlogPage {
  articles = [
    { id: 1, title: 'Préparer sa Omra', excerpt: 'Les étapes essentielles...', category: 'Guide' },
    { id: 2, title: 'Les rites de la Omra', excerpt: 'Tawaf, Sa’i...', category: 'Rituels' }
  ];
  searchQuery = '';

  get filteredArticles() {
    return this.articles.filter(a =>
      a.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectArticle(article: any) {
    console.log('Article sélectionné:', article);
  }
}
