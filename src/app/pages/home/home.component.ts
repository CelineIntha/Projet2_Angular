import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {OlympicCountry} from 'src/app/core/models/Olympic';
import {OlympicService} from 'src/app/core/services/olympic.service';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import {Router} from '@angular/router';
import {TooltipData} from "../../core/models/TooltipData";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  olympics: OlympicCountry[] | null = null;
  totalJO: number = 0;
  totalCountries: number = 0;
  errorMessage: string | null = null;
  isLoading: boolean = true;

  pieChartData: { name: string, value: number }[] = [];

  colorScheme: Color = {
    domain: ['#793d52', '#89a1db', '#9780a1', '#bee0f1', '#b9cbe7', '#956065'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'MedalsColorScheme'
  };

  view: [number, number];

  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService, private router: Router) {
    // Définit la taille initiale du graphique en fonction de la taille de la fenêtre du navigateur
    this.view = this.getViewSize(window.innerWidth);
  }

  ngOnInit() {
    this.subscription.add(
      this.olympicService.getOlympics()
        .pipe(
          catchError(error => {
            console.error('Erreur lors de la récupération des données olympiques:', error);
            this.errorMessage = 'Impossible de charger les données des Jeux Olympiques. Veuillez réessayer plus tard.';
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe(data => {
          this.isLoading = false;
          if (data) {
            this.olympics = data;
            this.calculateOlympicsData();
            this.prepareChartData();
          } else {
            this.errorMessage = 'Impossible de charger les données des Jeux Olympiques. Veuillez réessayer plus tard.';
          }
        })
    );
  }

  /**
   * Gestionnaire d'événement pour ajuster la taille du graphique lorsque la fenêtre est redimensionnée.
   * Il met à jour la propriété `view` en fonction de la nouvelle taille de l'écran.
   * Utilise un décorateur `HostListener` pour écouter l'événement de redimensionnement de la fenêtre.
   * @param event - L'événement de redimensionnement contenant la nouvelle taille de la fenêtre.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.view = this.getViewSize(target.innerWidth);
  }

  /**
   * Méthode pour calculer le nombre total de pays participants et de Jeux Olympiques (JO).
   * Cette méthode parcourt chaque pays et compte le nombre de participations pour accumuler le total des JO.
   */
  calculateOlympicsData() {
    if (this.olympics) {
      this.totalCountries = this.olympics.length;
      // Nombre d'entrées aux JO, donc se baser sur l'année
      this.totalJO = this.olympics.reduce((total, country) => total + country.participations.length, 0);
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
      this.pieChartData = this.olympics.map(country => {
        const totalMedalsForCountry = country.participations.reduce(
          (totalMedals, participation) => totalMedals + participation.medalsCount,
          0
        );

        return {
          name: country.country,
          value: totalMedalsForCountry
        };
      });
    } else {
      this.pieChartData = [];
    }
  }

  /**
   * Méthode pour récupérer le pays et le rédiriger vers la page détail
   * avec le nom du pays.
   */
  onSelect(event: { name: string }): void {
    const countryName = event.name;
    this.router.navigate(['/country', countryName]);
  }

  customTooltipData(data: TooltipData): string {
    return `
    <div class="tooltip">
      ${data.data.name || 'Country'}<br>
      <i class="fas fa-medal"></i> ${data.data.value || 0}
    </div>
  `;
  }


  /**
   * Méthode appelée à la destruction du composant pour libérer les ressources.
   * Désabonne tous les observables afin d'éviter des fuites de mémoire.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
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
}
