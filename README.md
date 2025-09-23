# webapp10

## Our goal is to make a videogame website "Steam" alike, called: MoreForPlaying

## Development team members:
1. Paula de la Fuente Ruiz	| p.delafuente.2024@alumnos.urjc.es	| Paula-2704
2. Francisco García González	| f.garcia.2024@alumnos.urjc.es	| Fran-G-G
3. Marcos Vidal Castillo |	m.vidalc.2024@alumnos.urjc.es	| MarcosVC

## Funcionalities

### Entities

#### Main entity (Videogame):
Attributes:

*id: Unique identifier 

*name: Product name

*description: Product description 

*price: Product price 

*category: Product category 

*creation_date: Creation date 

#### Secondary entity (Review):
Attributes:

*product_id: Reference to the product 

*review_test: Review content 

*rating: Score from 1 to 5 

*author: Review author name 

*review_date: Review date 

*is_verified: Verified purchase flag 

### Images
Entities will have associated images:

Product: Each product can have multiple images (main, additional photos)

Review: Reviews can include user-uploaded photos (screenshot, gameplay)

### Search, Filtering and Categorization

#### Search
Text search: Search by name and description across all entities

Advanced search: Combined filtering by multiple criteria

#### Filtering
By category: Filtering based on predefined categories

By date: Date range for creation/modification

By status: Filter by current element status

#### Categorization
Tag system for content classification
