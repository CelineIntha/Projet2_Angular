import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import {OlympicService} from 'src/app/core/services/olympic.service';
import {Subscription} from 'rxjs';
import {OlympicCountry} from "../../core/models/Olympic";
import {Participation} from "../../core/models/Participation";
import {HttpErrorResponse} from "@angular/common/http";
import {LineChartData} from "../../core/models/LineChartData";

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss'],
})
export class CountryDetailComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  countryName: string = '';
  totalMedals: number = 0;
  numberOfEntries: number = 0;
  totalAthletes: number = 0;
  errorMessage: string | null = null;
  isLoading: boolean = true

  lineChartData: LineChartData[] = [];
  view: [number, number] = [700, 400];

  colorScheme: Color = {
    name: 'MedalsColorScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#02838F', '#FF5733', '#33FF57']
  };

  legend: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Dates';
  yAxisLabel: string = 'Number of Medals';
  timeline: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {
  }

  ngOnInit(): void {
    this.view = this.getViewSize(window.innerWidth);

    const routeSubscription = this.route.params.subscribe((params) => {
      this.countryName = params['countryName'];
      this.loadCountryData(this.countryName);
    });
    this.subscription.add(routeSubscription);
  }

  /**
   * Charge les données d'un pays spécifique en utilisant le service Olympic.
   *
   * Cette méthode envoie une requête pour récupérer les données concernant
   * tous les pays participants aux Jeux Olympiques. Une fois les données obtenues,
   * elle extrait et met à jour les statistiques pour le pays sélectionné, incluant
   * le total de médailles, le nombre d'entrées aux JO, et le total d'athlètes.
   *
   * Si le pays n'est pas trouvé dans les données, l'utilisateur est redirigé
   * vers une page d'erreur 404, lui indiquant que le pays demandé n'existe pas
   * dans les enregistrements.
   *
   * @param countryName - Le nom du pays dont les données doivent être chargées.
   */
  loadCountryData(countryName: string) {
    this.isLoading = true;

    const olympicsSubscription = this.olympicService.getOlympics().subscribe({
      next: (olympicCountries: OlympicCountry[] | null) => {
        this.isLoading = false;
        if (olympicCountries) {
          const selectedCountry = olympicCountries.find(country => country.country === countryName);
          if (selectedCountry) {
            this.totalMedals = this.calculateTotalMedals(selectedCountry);
            this.numberOfEntries = selectedCountry.participations.length;
            this.totalAthletes = this.calculateTotalAthletes(selectedCountry);
            this.prepareLineChartData(selectedCountry);
          } else {
            console.error(`Aucune donnée trouvée pour le pays: ${countryName}`);
            this.router.navigate(['/404']);
          }
        } else {
          this.errorMessage = 'Erreur lors du chargement des données.';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur lors de la récupération des données:', error);
        if (error.status === 404) {
          this.errorMessage = `Le pays ${countryName} n'existe pas.`;
        } else {
          this.errorMessage = 'Impossible de charger les données. Veuillez réessayer.';
        }
      },
      complete: () => {
        console.log('Chargement des données terminé.');
      }
    });

    this.subscription.add(olympicsSubscription);
  }

  /**
   * C'est une méthode qui permet de calculer le nombre total de médailles gagnées par un pays.
   * @param country - Le pays dont on souhaite connaître le total des médailles.
   * @returns Le nombre total de médailles.
   */
  calculateTotalMedals(country: OlympicCountry): number {
    return country.participations.reduce((total, participation) => total + participation.medalsCount, 0);
  }

  /**
   * C'est une méthode qui permet de calculer le nombre total d'athlètes pour un pays.
   * @param country - Le pays dont on souhaite connaître le nombre total d'athlètes.
   * @returns Le nombre total d'athlètes.
   */
  calculateTotalAthletes(country: OlympicCountry): number {
    return country.participations.reduce((total, participation) => total + participation.athleteCount, 0);
  }

  /**
   * C'est une méthode qui permet de préparer les données du graphique linéaire pour chaque pays.
   * @param countryData - Les données du pays sélectionné.
   */
  prepareLineChartData(countryData: OlympicCountry) {
    const lineData = countryData.participations.map((participation: Participation) => {
      return {
        name: participation.year.toString(),
        value: participation.medalsCount
      };
    });

    this.lineChartData = [
      {
        name: this.countryName,
        series: lineData
      }
    ];
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
    this.view = this.getViewSize(target.innerWidth); // Je mets à jour la line chart
  }

  /**
   * Méthode privée pour obtenir la taille de la vue en fonction de la largeur de la fenêtre.
   * Renvoie un tuple contenant la largeur et la hauteur du graphique.
   * @param width - La largeur actuelle de la fenêtre du navigateur.
   * @returns Un tableau avec la largeur et la hauteur du graphique [width, height].
   */
  private getViewSize(width: number): [number, number] {
    return width <= 768 ? [420, 420] : [700, 400];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
