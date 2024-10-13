import {Component, OnInit, HostListener} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import {OlympicService} from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss'],
})
export class CountryDetailComponent implements OnInit {
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

  // Options pour le graphique
  legend: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Dates';
  yAxisLabel: string = 'Number of Medals';
  timeline: boolean = true;

  constructor(private route: ActivatedRoute, private olympicService: OlympicService) {
  }

  ngOnInit(): void {
    // Permet de gérer automatiquement la taille de la line chart en fonction de la taille de l'écran
    this.view = this.getViewSize(window.innerWidth);

    // S'abonner aux données des JO
    this.olympicService.getOlympics().subscribe(() => {
      // Ensuite, je recupère le nom du pays à partir des paramètres de la route
      this.route.params.subscribe(params => {
        this.countryName = params['countryName'];
        this.loadCountryData(this.countryName);
      });
    });
  }

  loadCountryData(countryName: string) {
    const {country, totalMedals} = this.olympicService.getCountryDataWithTotalMedals(countryName);

    // Je vérifie si le pays existe avant de charger les données
    if (country) {
      this.totalMedals = totalMedals;
      this.numberOfEntries = country.participations.length;
      this.totalAthletes = country.participations.reduce((total, p) => total + p.athleteCount, 0);
      this.prepareLineChartData(country);
    } else {
      console.error(`Aucune donnée trouvée pour le pays: ${countryName}`);
      //TODO
      // Gestion erreur utilisateur
    }
  }

  prepareLineChartData(countryData: any) {
    const lineData = countryData.participations.map((participation: any) => {
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

  // Me permet de capturer l'écran et d'ajuster la taille de la line chart
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.view = this.getViewSize(target.innerWidth); // Je mets à jour la line chart
  }

  private getViewSize(width: number): [number, number] {
    if (width <= 768) {
      return [420, 420];
    } else {
      return [700, 400];
    }
  }

  //TODO : Unsubscribe
}
