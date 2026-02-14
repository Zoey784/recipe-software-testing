document.addEventListener('DOMContentLoaded', () => {
  // Normalize backend recipe shape into the frontend shape expected by this UI
  function normalizeRecipe(r) {
    if (!r) return r;
    return {
      id: r.id ?? r.recipe_id ?? r.ID,
      title: r.title ?? r.name ?? 'Untitled',
      description: r.description ?? '',
      category: r.category ?? r.difficulty_level ?? 'General',
      cookTime: r.cookTime ?? r.cooking_time ?? '',
      prepTime: r.prepTime ?? r.prep_time ?? '',
      totalTime: r.totalTime ?? r.total_time ?? '',
      imageUrl: r.imageUrl ?? r.image_url ?? 'image/placeholder.svg',
      ingredients: r.ingredients ?? [],
      preparation: r.preparation ?? r.steps ?? '',
      link: r.link ?? (r.id ? `recipe.html?id=${r.id}` : '#'),
    };
  }
  
  function normalizeList(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeRecipe);
  }
  // --- INDEX PAGE ---
  const latestContainer = document.getElementById('LatestRecipe');
  const indexCategoryContainer = document.getElementById('Category');

  if (latestContainer) {
    latestContainer.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
    fetch('/latest-recipes')
      .then(res => res.json())
      .then(data => { data = normalizeList(data);
        data.sort((a, b) => a.id - b.id);
        const oldestFive = data.slice(0, 5);
        latestContainer.innerHTML = '';
        oldestFive.forEach(recipe => {
          const a = document.createElement('a');
          a.className = 'flex-1 min-w-[180px] max-w-xs basis-1/6 group block overflow-hidden border rounded-xl transition hover:shadow-lg';
          a.href = recipe.link;
          a.innerHTML = `
            <div class="w-full h-48 overflow-hidden">
              <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 class="p-4 text-center font-medium transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
          `;
          latestContainer.appendChild(a);
        });
      })
      .catch(console.error);
  }

  if (indexCategoryContainer) {
    indexCategoryContainer.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
    fetch('/recipes')
      .then(res => res.json())
      .then(data => { data = normalizeList(data);
        const categories = [...new Set(data.map(recipe => recipe.category))];
        const shuffled = categories.sort(() => 0.5 - Math.random());
        const randomFive = shuffled.slice(0, 5);

        indexCategoryContainer.innerHTML = '';

        randomFive.forEach(category => {
          const recipeForImage = data.find(r => r.category === category);
          const a = document.createElement('a');
          a.className = 'flex-1 min-w-[150px] max-w-xs basis-1/6 flex flex-col items-center group transition hover:shadow-lg';
          a.href = `category.html?category=${encodeURIComponent(category)}`;
          a.innerHTML = `
            <div class="w-full h-48 overflow-hidden rounded-full">
              <img src="${recipeForImage.imageUrl}" alt="${category}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 class="p-4 text-center font-medium transition-colors duration-300 group-hover:text-red-500">${category}</h3>
          `;
          indexCategoryContainer.appendChild(a);
        });
      })
      .catch(console.error);
  }

  // --- CATEGORY-ALL PAGE ---
  const categoryAllContainer = document.getElementById('Category-All');
  if (categoryAllContainer) {
    categoryAllContainer.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
    fetch('/recipes')
      .then(res => res.json())
      .then(data => { data = normalizeList(data);
        const categories = [...new Set(data.map(recipe => recipe.category))];
        if (categories.length === 0) {
          categoryAllContainer.innerHTML = '<p>No categories found.</p>';
        } else {
          categories.forEach(category => {
            const a = document.createElement('a');
            a.href = `recipe-all.html?category=${encodeURIComponent(category)}`;
            a.className = 'flex items-center justify-center w-48 h-24 border rounded-lg bg-white hover:bg-gray-100 shadow transition text-lg font-medium';
            a.textContent = category;
            categoryAllContainer.appendChild(a);
          });
        }
      })
      .catch(console.error);
  }

  // --- CATEGORY PAGE ---
  const catTitleEl = document.getElementById('Category-Title');
  const catListContainer = document.getElementById('Category-Listing');
  if (catTitleEl && catListContainer) {
    catListContainer.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    catTitleEl.textContent = category + ' Recipes';
    fetch('/recipes')
      .then(res => res.json())
      .then(data => { data = normalizeList(data);
        const filtered = data.filter(recipe => recipe.category === category);
        catListContainer.innerHTML = '';
        filtered.forEach(recipe => {
          const div = document.createElement('div');
          div.className = 'flex-1 min-w-[180px] max-w-xs basis-1/5 group block overflow-hidden border rounded-xl transition hover:shadow-lg';
          div.innerHTML = `
            <a href="${recipe.link}">
              <div class="w-full h-48 overflow-hidden">
                <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="p-4 text-center font-medium transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
            </a>
          `;
          catListContainer.appendChild(div);
        });
      })
      .catch(console.error);
  }

  // --- RECIPE PAGE ---
const recipeTitleEl = document.getElementById('recipe-title');
if (recipeTitleEl) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  fetch('/recipes')
    .then(res => res.json())
    .then(data => { data = normalizeList(data);
      const recipe = data.find(r => r.id == id);
      if (!recipe) {
        recipeTitleEl.innerText = 'Recipe not found';
        return;
      }
      recipeTitleEl.innerText = recipe.title;
      document.getElementById('recipe-description').innerText = recipe.description;
      document.getElementById('recipe-image').src = recipe.imageUrl;
      document.getElementById('recipe-image').alt = recipe.title;
      document.getElementById('total-time').innerText = recipe.totalTime;
      document.getElementById('prep-time').innerText = recipe.prepTime;
      document.getElementById('cook-time').innerText = recipe.cookTime;

      const ingredientsList = document.getElementById('ingredients-list');
      recipe.ingredients.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        ingredientsList.appendChild(li);
      });

      const preparationSteps = document.getElementById('preparation-steps');
      recipe.preparation.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        preparationSteps.appendChild(li);
      });

      const relatedContainer = document.getElementById('related-recipes-list');
      if (relatedContainer) {
        relatedContainer.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
        const relatedRecipes = data.filter(r => r.id != id);
        relatedRecipes.sort(() => 0.5 - Math.random());
        const fiveRelated = relatedRecipes.slice(0, 5);
        fiveRelated.forEach(recipe => {
          const a = document.createElement('a');
          a.href = recipe.link || `recipe.html?id=${recipe.id}&slug=${recipe.title.replace(/\s+/g, '-')}`;
          a.className = ` w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 block border rounded-xl overflow-hidden group transition hover:shadow-lg`.replace(/\s+/g, ' ').trim();
          a.innerHTML = `
            <div class="w-full h-40 overflow-hidden rounded-t-xl">
              <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 class="p-3 text-center font-medium transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
          `;
          relatedContainer.appendChild(a);
        });
      }
    })
    .catch(console.error);
}

  // --- RECIPE-ALL PAGE with search ---
  const container = document.getElementById('all-recipes');
  const searchInput = document.getElementById('searchitem');
  const suggestions = document.getElementById('suggestions');
  const searchForm = document.getElementById('search-form');
  if (container && searchInput && suggestions && searchForm) {
    container.classList.add('flex', 'flex-wrap', 'gap-5', 'justify-center');
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category')?.trim();

    let allRecipes = [];
    let filteredRecipes = [];

    fetch('/recipes')
      .then(res => res.json())
      .then(data => { data = normalizeList(data);
        allRecipes = data;
        if (categoryFilter) {
          filteredRecipes = allRecipes.filter(r =>
            r.category && r.category.toLowerCase() === categoryFilter.toLowerCase()
          );
        } else {
          filteredRecipes = allRecipes;
        }
        renderRecipes(filteredRecipes);
      })
      .catch(error => {
        console.error('Error loading recipes:', error);
        container.innerHTML = '<p>Failed to load recipes.</p>';
      });

    function renderRecipes(recipes) {
      container.innerHTML = '';
      if (recipes.length === 0) {
        container.innerHTML = '<p class="text-center w-full">No recipes found.</p>';
        return;
      }
      recipes.forEach(recipe => {
        const a = document.createElement('a');
        a.href = `recipe.html?id=${recipe.id}`;
        a.className = 'flex-shrink-0 w-full sm:w-64 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300';
        a.innerHTML = `
          <div class="h-40 overflow-hidden">
            <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover" />
          </div>
          <h3 class="text-center p-3 font-semibold">${recipe.title}</h3>
        `;
        container.appendChild(a);
      });
    }

    function filterRecipes(term) {
      const lowerTerm = term.toLowerCase();
      return filteredRecipes.filter(r => r.title.toLowerCase().includes(lowerTerm));
    }

    function showSuggestions(matches) {
      suggestions.innerHTML = '';
      if (matches.length === 0) {
        suggestions.classList.add('hidden');
        return;
      }
      matches.forEach(recipe => {
        const li = document.createElement('li');
        li.textContent = recipe.title;
        li.className = 'px-4 py-2 cursor-pointer hover:bg-gray-200';
        li.addEventListener('click', () => {
          window.location.href = `recipe.html?id=${recipe.id}`;
        });
        suggestions.appendChild(li);
      });
      suggestions.classList.remove('hidden');
    }

    searchInput.addEventListener('input', () => {
      const value = searchInput.value.trim();
      if (value.length === 0) {
        suggestions.classList.add('hidden');
        renderRecipes(filteredRecipes);
        return;
      }
      const matchedRecipes = filterRecipes(value);
      showSuggestions(matchedRecipes);
      renderRecipes(matchedRecipes);
    });

    document.addEventListener('click', (e) => {
      if (!suggestions.contains(e.target) && e.target !== searchInput) {
        suggestions.classList.add('hidden');
      }
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length === 0) {
        renderRecipes(filteredRecipes);
        suggestions.classList.add('hidden');
        return;
      }
      const results = filterRecipes(query);
      renderRecipes(results);
      suggestions.classList.add('hidden');
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        status.textContent = 'Thank you for your message! We will get back to you soon.';
        status.className = 'text-green-600 text-sm text-center mt-3';
        form.reset();
      } else {
        status.textContent = 'Failed to send message. Please try again.';
        status.className = 'text-red-600 text-sm text-center mt-3';
      }
    } catch (error) {
      console.error('Error sending form:', error);
      status.textContent = 'An error occurred. Please try again.';
      status.className = 'text-red-600 text-sm text-center mt-3';
    }
  });
});

// document.addEventListener('DOMContentLoaded', () => {
//   // --- INDEX PAGE ---
//   const latestContainer = document.getElementById('LatestRecipe');
//   const indexCategoryContainer = document.getElementById('Category');

//   if (latestContainer) {
//     fetch('/latest-recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         data.sort((a, b) => a.id - b.id);
//         const oldestFive = data.slice(0, 5);
//         latestContainer.innerHTML = '';
//         oldestFive.forEach(recipe => {
//           const a = document.createElement('a');
//           a.className = 'w-[19%] h-[250px] group block overflow-hidden border rounded-full border-gray-300 rounded-xl';
//           a.href = recipe.link;
//           a.innerHTML = `
//             <div class="w-full h-[68%] overflow-hidden">
//               <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//             </div>
//             <h3 class="p-4 transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
//           `;
//           latestContainer.appendChild(a);
//         });
//       })
//       .catch(console.error);
//   }

//   if (indexCategoryContainer) {
//     fetch('/recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         const categories = [...new Set(data.map(recipe => recipe.category))];
//         const shuffled = categories.sort(() => 0.5 - Math.random());
//         const randomFive = shuffled.slice(0, 5);

//         indexCategoryContainer.innerHTML = '';

//         randomFive.forEach(category => {
//           const recipeForImage = data.find(r => r.category === category);
//           const a = document.createElement('a');
//           a.className = 'w-[15%] h-full flex flex-col items-center group';
//           a.href = `/public/category.html?category=${encodeURIComponent(category)}`;
//           a.innerHTML = `
//             <div class="w-full h-[186px] overflow-hidden rounded-full">
//               <img src="${recipeForImage.imageUrl}" alt="${category}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//             </div>
//             <h3 class="p-4 transition-colors duration-300 group-hover:text-red-500">${category}</h3>
//           `;
//           indexCategoryContainer.appendChild(a);
//         });
//       })
//       .catch(console.error);
//   }

//   // --- CATEGORY-ALL PAGE ---
//   const categoryAllContainer = document.getElementById('Category-All');
//   if (categoryAllContainer) {
//     fetch('/recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         const categories = [...new Set(data.map(recipe => recipe.category))];
//         if (categories.length === 0) {
//           categoryAllContainer.innerHTML = '<p>No categories found.</p>';
//         } else {
//           categories.forEach(category => {
//             const a = document.createElement('a');
//             a.href = `recipe-all.html?category=${encodeURIComponent(category)}`;
//             a.className = 'flex items-center justify-center w-48 h-24 border rounded-lg bg-white hover:bg-gray-100 shadow transition text-lg font-medium';
//             a.textContent = category;
//             categoryAllContainer.appendChild(a);
//           });
//         }
//       })
//       .catch(console.error);
//   }

//   // --- CATEGORY PAGE ---
//   const catTitleEl = document.getElementById('Category-Title');
//   const catListContainer = document.getElementById('Category-Listing');
//   if (catTitleEl && catListContainer) {
//     const params = new URLSearchParams(window.location.search);
//     const category = params.get('category');
//     catTitleEl.textContent = category + ' Recipes';
//     catTitleEl.href = '#';
//     fetch('/recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         const filtered = data.filter(recipe => recipe.category === category);
//         catListContainer.innerHTML = '';
//         filtered.forEach(recipe => {
//           const div = document.createElement('div');
//           div.className = 'w-[19%] group block overflow-hidden border rounded-xl';
//           div.innerHTML = `
//             <a href="${recipe.link}">
//               <div class="w-full h-[200px] overflow-hidden">
//                 <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//               </div>
//               <h3 class="p-4 transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
//             </a>
//           `;
//           catListContainer.appendChild(div);
//         });
//       })
//       .catch(console.error);
//   }

//   // --- RECIPE PAGE ---
//   const recipeTitleEl = document.getElementById('recipe-title');
//   if (recipeTitleEl) {
//     const urlParams = new URLSearchParams(window.location.search);
//     const id = urlParams.get('id');
//     fetch('/recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         const recipe = data.find(r => r.id == id);
//         if (!recipe) {
//           recipeTitleEl.innerText = 'Recipe not found';
//           return;
//         }
//         recipeTitleEl.innerText = recipe.title;
//         document.getElementById('recipe-description').innerText = recipe.description;
//         document.getElementById('recipe-image').src = recipe.imageUrl;
//         document.getElementById('recipe-image').alt = recipe.title;
//         document.getElementById('total-time').innerText = recipe.totalTime;
//         document.getElementById('prep-time').innerText = recipe.prepTime;
//         document.getElementById('cook-time').innerText = recipe.cookTime;

//         const ingredientsList = document.getElementById('ingredients-list');
//         recipe.ingredients.forEach(item => {
//           const li = document.createElement('li');
//           li.innerText = item;
//           ingredientsList.appendChild(li);
//         });

//         const preparationSteps = document.getElementById('preparation-steps');
//         recipe.preparation.forEach(step => {
//           const li = document.createElement('li');
//           li.innerText = step;
//           preparationSteps.appendChild(li);
//         });

//         const relatedContainer = document.getElementById('related-recipes-list');
//         if (relatedContainer) {
//           const relatedRecipes = data.filter(r => r.id != id);
//           relatedRecipes.sort(() => 0.5 - Math.random());
//           const fiveRelated = relatedRecipes.slice(0, 5);
//           fiveRelated.forEach(recipe => {
//             const a = document.createElement('a');
//             a.href = recipe.link || `recipe.html?id=${recipe.id}`;
//             a.className = 'w-[18%] block border rounded-xl overflow-hidden group';
//             a.innerHTML = `
//               <div class="w-full h-[150px] overflow-hidden rounded-t-xl">
//                 <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//               </div>
//               <h3 class="p-3 text-center transition-colors duration-300 group-hover:text-red-500">${recipe.title}</h3>
//             `;
//             relatedContainer.appendChild(a);
//           });
//         }
//       })
//       .catch(console.error);
//   }

//   // --- RECIPE-ALL PAGE with search ---
//   const container = document.getElementById('all-recipes');
//   const searchInput = document.getElementById('searchitem');
//   const suggestions = document.getElementById('suggestions');
//   const searchForm = document.getElementById('search-form');
//   if (container && searchInput && suggestions && searchForm) {
//     const params = new URLSearchParams(window.location.search);
//     const categoryFilter = params.get('category')?.trim();

//     let allRecipes = [];
//     let filteredRecipes = [];

//     fetch('/recipes')
//       .then(res => res.json())
//       .then(data => { data = normalizeList(data);
//         allRecipes = data;
//         if (categoryFilter) {
//           filteredRecipes = allRecipes.filter(r =>
//             r.category && r.category.toLowerCase() === categoryFilter.toLowerCase()
//           );
//         } else {
//           filteredRecipes = allRecipes;
//         }
//         renderRecipes(filteredRecipes);
//       })
//       .catch(error => {
//         console.error('Error loading recipes:', error);
//         container.innerHTML = '<p>Failed to load recipes.</p>';
//       });

//     function renderRecipes(recipes) {
//       container.innerHTML = '';
//       if (recipes.length === 0) {
//         container.innerHTML = '<p class="text-center w-full">No recipes found.</p>';
//         return;
//       }
//       recipes.forEach(recipe => {
//         const a = document.createElement('a');
//         a.href = `recipe.html?id=${recipe.id}`;
//         a.className = 'flex-shrink-0 w-64 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300';
//         a.innerHTML = `
//           <div class="h-40 overflow-hidden">
//             <img src="${recipe.imageUrl || 'image/placeholder.svg'}" alt="${recipe.title}" class="w-full h-full object-cover" />
//           </div>
//           <h3 class="text-center p-3 font-semibold">${recipe.title}</h3>
//         `;
//         container.appendChild(a);
//       });
//     }

//     function filterRecipes(term) {
//       const lowerTerm = term.toLowerCase();
//       return filteredRecipes.filter(r => r.title.toLowerCase().includes(lowerTerm));
//     }

//     function showSuggestions(matches) {
//       suggestions.innerHTML = '';
//       if (matches.length === 0) {
//         suggestions.classList.add('hidden');
//         return;
//       }
//       matches.forEach(recipe => {
//         const li = document.createElement('li');
//         li.textContent = recipe.title;
//         li.className = 'px-4 py-2 cursor-pointer hover:bg-gray-200';
//         li.addEventListener('click', () => {
//           window.location.href = `recipe.html?id=${recipe.id}`;
//         });
//         suggestions.appendChild(li);
//       });
//       suggestions.classList.remove('hidden');
//     }

//     searchInput.addEventListener('input', () => {
//       const value = searchInput.value.trim();
//       if (value.length === 0) {
//         suggestions.classList.add('hidden');
//         renderRecipes(filteredRecipes);
//         return;
//       }
//       const matchedRecipes = filterRecipes(value);
//       showSuggestions(matchedRecipes);
//       renderRecipes(matchedRecipes);
//     });

//     document.addEventListener('click', (e) => {
//       if (!suggestions.contains(e.target) && e.target !== searchInput) {
//         suggestions.classList.add('hidden');
//       }
//     });

//     searchForm.addEventListener('submit', (e) => {
//       e.preventDefault();
//       const query = searchInput.value.trim();
//       if (query.length === 0) {
//         renderRecipes(filteredRecipes);
//         suggestions.classList.add('hidden');
//         return;
//       }
//       const results = filterRecipes(query);
//       renderRecipes(results);
//       suggestions.classList.add('hidden');
//     });
//   }
// });

// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('contact-form');
//   const status = document.getElementById('form-status');

//   if (!form) return; // If no contact form on page, stop

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     // Get form data
//     const formData = {
//       name: form.name.value,
//       email: form.email.value,
//       message: form.message.value,
//     };

//     try {
//       // Send form data to backend
//       const res = await fetch('/api/contact', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       const result = await res.json();

//       if (res.ok && result.success) {
//         status.textContent = 'Thank you for your message! We will get back to you soon.';
//         status.className = 'text-green-600 text-sm text-center mt-3';
//         form.reset();
//       } else {
//         status.textContent = 'Failed to send message. Please try again.';
//         status.className = 'text-red-600 text-sm text-center mt-3';
//       }
//     } catch (error) {
//       console.error('Error sending form:', error);
//       status.textContent = 'An error occurred. Please try again.';
//       status.className = 'text-red-600 text-sm text-center mt-3';
//     }
//   });
// });
