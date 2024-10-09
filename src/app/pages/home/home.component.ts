import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Liste des pays olympiques, initialisée à null pour attendre les données
  olympics: OlympicCountry[] | null = null;
  totalMedals: number = 0;
  totalCountries: number = 0;
  pieChartData: any[] = [];

  // Schéma de couleur pour le graphique ngx-charts
  colorScheme: Color = {
    domain: ['#793d52', '#89a1db', '#9780a1', '#bee0f1', '#b9cbe7', '#956065'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'MedalsColorScheme'
  };

  view: [number, number];

  // Subscription pour gérer les observables et éviter les fuites de mémoire
  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService) {
    // Définit la taille initiale du graphique en fonction de la taille de la fenêtre du navigateur
    this.view = this.getViewSize(window.innerWidth);
  }

  ngOnInit() {
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe()
    );

    this.subscription.add(
      this.olympicService.getOlympics().subscribe(data => {
        this.olympics = data;
        this.calculateOlympicsData();
        this.prepareChartData();
      })
    );
  }

  /**
   * Méthode privée pour obtenir la taille de la vue en fonction de la largeur de la fenêtre.
   * Renvoie un tuple contenant la largeur et la hauteur du graphique.
   * @param width - La largeur actuelle de la fenêtre du navigateur.
   * @returns Un tableau avec la largeur et la hauteur du graphique [width, height].
   */
  private getViewSize(width: number): [number, number] {
    if (width <= 768) {
      return [420, 420];
    } else {
      return [600, 600];
    }
  }

  /**
   * Gestionnaire d'événement pour ajuster la taille du graphique lorsque la fenêtre est redimensionnée.
   * Il met à jour la propriété `view` en fonction de la nouvelle taille de l'écran.
   * Utilise un décorateur `HostListener` pour écouter l'événement de redimensionnement de la fenêtre.
   * @param event - L'événement de redimensionnement contenant la nouvelle taille de la fenêtre.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.view = this.getViewSize(event.target.innerWidth);
  }

  /**
   * Méthode pour calculer le nombre total de pays participants et de médailles gagnées.
   * Cette méthode parcourt chaque pays, puis parcourt les participations de chaque pays
   * pour accumuler le total des médailles.
   */
  calculateOlympicsData() {
    if (this.olympics) {

      this.totalCountries = this.olympics.length;

      this.totalMedals = 0;

      for (const country of this.olympics) {
        for (const participation of country.participations) {
          this.totalMedals += participation.medalsCount;
        }
      }
    }
  }

  /**
   * Prépare les données nécessaires pour le graphique.
   * Cette méthode parcourt chaque pays et calcule le nombre total de médailles
   * qu'il a gagné, puis formate les données pour qu'elles soient compatibles avec
   * ngx-charts.
   */
  prepareChartData() {
    if (this.olympics) {
      const chartData: any[] = [];

      this.olympics.forEach(country => {
        const countryName = country.country;

        const totalMedalsForCountry = country.participations.reduce(
          (totalMedals, participation) => {
            return totalMedals + participation.medalsCount;
          },
          0 
        );

        const countryData = {
          name: countryName,
          value: totalMedalsForCountry
        };

        chartData.push(countryData);
      });
      
      this.pieChartData = chartData;
    } else {
      // Si les données olympiques ne sont pas encore disponibles, assigne un tableau vide
      this.pieChartData = [];
    }
  }

  /**
   * Méthode appelée à la destruction du composant pour libérer les ressources.
   * Désabonne tous les observables afin d'éviter des fuites de mémoire.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
