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

  // Total des médailles obtenues par l'ensemble des pays
  totalMedals: number = 0;

  // Total des pays participants aux jeux olympiques
  totalCountries: number = 0;

  // Données pour le graphique en secteurs (camembert)
  pieChartData: any[] = [];

  // Schéma de couleur pour le graphique à secteurs, défini via ngx-charts
  colorScheme: Color = {
    domain: ['#793d52', '#89a1db', '#9780a1', '#bee0f1', '#b9cbe7', '#956065'],
    group: ScaleType.Ordinal,  // Type de la palette de couleurs
    selectable: true,          // Permet de sélectionner les couleurs
    name: 'MedalsColorScheme'   // Nom du schéma de couleurs
  };

  // Propriété définissant les dimensions de la vue pour le graphique
  view: [number, number];

  // Subscription pour gérer les observables et éviter les fuites de mémoire
  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService) {
    // Définit la taille initiale du graphique en fonction de la taille de la fenêtre du navigateur
    this.view = this.getViewSize(window.innerWidth);
  }

  ngOnInit() {
    // Charge les données initiales des Jeux Olympiques
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe()
    );

    // S'abonne à l'observable pour obtenir les données des pays olympiques
    this.subscription.add(
      this.olympicService.getOlympics().subscribe(data => {
        this.olympics = data;

        // Appelle la méthode pour calculer le total des médailles et des pays
        this.calculateOlympicsData();

        // Prépare les données pour le graphique en secteurs
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
      // Si la largeur de l'écran est inférieure ou égale à 768px, on renvoie une vue plus petite
      return [420, 420];
    } else {
      // Sinon, on renvoie une vue plus grande
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
      // Nombre total de pays participants
      this.totalCountries = this.olympics.length;

      // Réinitialise le compteur total de médailles
      this.totalMedals = 0;

      // Parcourt chaque pays
      for (const country of this.olympics) {
        // Parcourt les participations de chaque pays
        for (const participation of country.participations) {
          // Ajoute le nombre de médailles de chaque participation au total
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
      // Initialise un tableau vide pour stocker les données formatées
      const chartData: any[] = [];

      // Parcourt chaque pays
      this.olympics.forEach(country => {
        const countryName = country.country;

        // Calcule le total des médailles pour le pays
        const totalMedalsForCountry = country.participations.reduce(
          (totalMedals, participation) => {
            return totalMedals + participation.medalsCount;
          },
          0 // Valeur initiale du total de médailles (0)
        );

        // Crée un objet contenant le nom du pays et son total de médailles
        const countryData = {
          name: countryName,
          value: totalMedalsForCountry
        };

        // Ajoute les données formatées au tableau des données du graphique
        chartData.push(countryData);
      });

      // Assigne les données préparées à la propriété `pieChartData`
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
