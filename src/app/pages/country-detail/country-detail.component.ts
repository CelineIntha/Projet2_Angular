import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import {OlympicService} from 'src/app/core/services/olympic.service';
import {Subscription} from 'rxjs';
import {OlympicCountry} from "../../core/models/Olympic";
import {Participation} from "../../core/models/Participation";

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

  // Configuration des options pour le graphique
  lineChartData: any[] = [];
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
    private olympicService: OlympicService
  ) {
  }

  ngOnInit(): void {
    this.view = this.getViewSize(window.innerWidth);

    // Je m'abonne aux paramètres de la route pour récupérer le nom du pays
    const routeSubscription = this.route.params.subscribe((params) => {
      this.countryName = params['countryName'];
      this.loadCountryData(this.countryName);
    });
    this.subscription.add(routeSubscription);
  }

  loadCountryData(countryName: string) {
    const olympicsSubscription = this.olympicService.getOlympics().subscribe((olympicCountries: OlympicCountry[] | null) => {
      if (olympicCountries) {
        const selectedCountry = olympicCountries.find(country => country.country === countryName);
        if (selectedCountry) {
          this.totalMedals = this.calculateTotalMedals(selectedCountry);
          this.numberOfEntries = selectedCountry.participations.length;
          this.totalAthletes = this.calculateTotalAthletes(selectedCountry);
          this.prepareLineChartData(selectedCountry);
        } else {
          console.error(`Aucune donnée trouvée pour le pays: ${countryName}`);
          // TODO: Afficher un message d'erreur ou rediriger l'utilisateur
        }
      }
    });
    this.subscription.add(olympicsSubscription);
  }

  // Méthode pour calculer le total des médailles
  calculateTotalMedals(country: OlympicCountry): number {
    return country.participations.reduce((total, participation) => total + participation.medalsCount, 0);
  }

  // Méthode pour calculer le total des athlètes
  calculateTotalAthletes(country: OlympicCountry): number {
    return country.participations.reduce((total, participation) => total + participation.athleteCount, 0);
  }

  // Préparation des données pour le graphique
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

  // Capture l'événement de redimensionnement de la fenêtre et ajuste la taille du graphique
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.view = this.getViewSize(target.innerWidth); // Je mets à jour la line chart
  }

  private getViewSize(width: number): [number, number] {
    return width <= 768 ? [420, 420] : [700, 400];
  }

  ngOnDestroy(): void {
    // Je me désabonne de tous les abonnements
    this.subscription.unsubscribe();
  }
}
