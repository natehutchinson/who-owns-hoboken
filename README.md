# Who owns hoboken?

## What is this?
This map displays all rental properties (both apartments and condo/co-op units that are rented) in Hoboken, and contains information about ownership of each building/unit. It aims to shed light on the high concentration of apartment units in the hands of a small number of landlords, and to serve as an organizing tool by allowing tenants to identify other buildings with the same landlord as theirs. In light of recent [rent increases](https://jerseydigs.com/hoboken-rent-increases/), increased tenant activity is crucuial to keeping Hoboken affordable.   

_Initial map view_
<img width="638" alt="image" src="https://github.com/nh1917/who-owns-hoboken/assets/16247226/d41ff31d-7896-475e-ad56-16993a5bdef5">

## How to use this map
The user can click on the property they are interested in to see more information. Hovering over a property will bring up the building address, landlord (if it is an apartment building), and rent control status. Clicking the property will highlight that property along with all other properties owned by the same landlord. It will also bring up more details about the property and the landlord's portfolio in the sidebar.

_Example: 501 1st Street_
<img width="1428" alt="image" src="https://github.com/nh1917/who-owns-hoboken/assets/16247226/48b96b60-8eac-4fea-8095-2bd4215ad13f">
The above screenshot shows what happens when the property at 501 1st Street is selected. Note that all of the properties belonging to this landlord (Jersey Homes) remain in their original color, while all other properties are a faint gray. The sidebar shows the landlord's business address, and a table below shows the addresses of all the properties owned by Jersey Homes. 

## Data
The data was compiled for Hudson County tax assessor's [website](https://www.hcnj.us/finance/tax-assessments/). 

## Further development
There are two enhancements that could be made to improve the funtionality of this map:

1. Add buttons allowing the user to filter based on certain characteristics (i.e. rent control status, landlord size, etc.).
2. Improve how the map deals with condos. Condos are treated as separate properties, even if they do are located in the same building. This means that there may be condo points in the exact same place on the map, but only the top one would be clickable. This could be improved by creating an additional condo data set that allows for building-level summaries to populate the sidebar, which could then link to a landlord-level view. 
3. Experiment with different geocoding APIs when generating the input geojsons, as some of the points look a little off. Currently the [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/) is used.
