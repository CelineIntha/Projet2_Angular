import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CountryDetailComponent } from './pages/country-detail/country-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home'
  },
  {
    path: 'country',
    component: CountryDetailComponent,
    title: 'Country'
  },
  {
    path: 'country/:countryName',
    component: CountryDetailComponent,
    title: 'Country Détail'
  },
  {
    path: '**', // wildcard
    component: NotFoundComponent,
    title: 'Page404'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
