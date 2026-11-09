(function () {
    'use strict';

    function toTokens(value) {
        return String(value || '')
            .split(/\s+/)
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean);
    }

    function unique(values) {
        return values.filter(function (value, index, list) {
            return list.indexOf(value) === index;
        });
    }

    function initProductsSelector(root) {
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-product-card]'));
        var inputs = Array.prototype.slice.call(root.querySelectorAll('.gpl-filter-input'));
        var seriesButtons = Array.prototype.slice.call(root.querySelectorAll('[data-series-filter]'));
        var countNodes = Array.prototype.slice.call(root.querySelectorAll('[data-result-count]'));
        var noMatch = root.querySelector('[data-no-match]');
        var clearButtons = Array.prototype.slice.call(root.querySelectorAll('[data-clear-filters]'));
        var filterDetails = root.querySelector('[data-filter-details]');
        var titleNode = root.querySelector('[data-results-title]');
        var localizedLabels = {
            featuredTitle: root.getAttribute('data-i18n-featured-title') || 'Featured product routes',
            allTitle: root.getAttribute('data-i18n-all-title') || 'All product routes',
            matchedTitle: root.getAttribute('data-i18n-matched-title') || 'Matched product routes',
            productRoutes: root.getAttribute('data-i18n-product-routes') || 'product routes',
            routeSingular: root.getAttribute('data-i18n-route-singular') || 'route',
            routePlural: root.getAttribute('data-i18n-route-plural') || 'routes'
        };
        var activeSeries = 'featured';
        var desktopFilterQuery = window.matchMedia('(min-width: 1025px)');

        function selectedFilters() {
            return inputs
                .filter(function (input) {
                    return input.checked;
                })
                .reduce(function (groups, input) {
                    var group = input.getAttribute('data-filter-group') || '';
                    if (!group) {
                        return groups;
                    }

                    if (!groups[group]) {
                        groups[group] = [];
                    }

                    groups[group].push(input.value);
                    groups[group] = unique(groups[group]);
                    return groups;
                }, {});
        }

        function matchesGroup(card, group, values) {
            var cardValues = toTokens(card.getAttribute('data-' + group));

            if (!values.length) {
                return true;
            }

            if (group === 'flags') {
                return values.every(function (value) {
                    return cardValues.indexOf(value) !== -1;
                });
            }

            return values.some(function (value) {
                return cardValues.indexOf(value) !== -1;
            });
        }

        function updateCounts(visibleCount) {
            var label = visibleCount === 1
                ? '1 ' + localizedLabels.routeSingular
                : visibleCount + ' ' + localizedLabels.routePlural;
            countNodes.forEach(function (node) {
                node.textContent = label;
            });
        }

        function updateSeriesButtons() {
            seriesButtons.forEach(function (button) {
                var isActive = button.getAttribute('data-series-filter') === activeSeries;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });

            if (titleNode) {
                var activeButton = seriesButtons.filter(function (button) {
                    return button.getAttribute('data-series-filter') === activeSeries;
                })[0];
                var label = activeButton ? activeButton.getAttribute('data-series-label') : '';

                if (activeSeries === 'featured') {
                    titleNode.textContent = localizedLabels.featuredTitle;
                } else if (activeSeries === 'all') {
                    titleNode.textContent = localizedLabels.allTitle;
                } else {
                    titleNode.textContent = label ? label + ' ' + localizedLabels.productRoutes : localizedLabels.matchedTitle;
                }
            }
        }

        function syncFilterOpenState() {
            if (!filterDetails) {
                return;
            }

            filterDetails.open = desktopFilterQuery.matches;
        }

        function applyFilters() {
            var groups = selectedFilters();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var seriesMatches = activeSeries === 'all'
                    || (activeSeries === 'featured' && card.getAttribute('data-featured') === 'true')
                    || card.getAttribute('data-series') === activeSeries;
                var groupMatches = Object.keys(groups).every(function (group) {
                    return matchesGroup(card, group, groups[group]);
                });
                var isVisible = seriesMatches && groupMatches;

                card.hidden = !isVisible;

                if (isVisible) {
                    visibleCount += 1;
                }
            });

            updateCounts(visibleCount);

            if (noMatch) {
                noMatch.hidden = visibleCount !== 0;
            }
        }

        seriesButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeSeries = button.getAttribute('data-series-filter') || 'all';
                updateSeriesButtons();
                applyFilters();
            });
        });

        inputs.forEach(function (input) {
            input.addEventListener('change', applyFilters);
        });

        clearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                inputs.forEach(function (input) {
                    input.checked = false;
                });
                activeSeries = 'featured';
                updateSeriesButtons();
                applyFilters();
            });
        });

        if (desktopFilterQuery.addEventListener) {
            desktopFilterQuery.addEventListener('change', syncFilterOpenState);
        } else if (desktopFilterQuery.addListener) {
            desktopFilterQuery.addListener(syncFilterOpenState);
        }

        syncFilterOpenState();
        updateSeriesButtons();
        applyFilters();
        // All cards are readable in the source HTML. Enable controls only after
        // enhancement and its initial filter have finished successfully.
        inputs.concat(seriesButtons, clearButtons).forEach(function (control) {
            control.disabled = false;
        });
        root.setAttribute('data-selector-ready', 'true');
    }

    function boot() {
        Array.prototype.slice.call(document.querySelectorAll('[data-products-selector]')).forEach(initProductsSelector);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}());

/* Safe preview-only UI. No requests, tracking, persistence, submissions or permission changes. */
(() => {
 'use strict';
 const main=document.querySelector('.grecho-existing'); if(!main)return;
 const faqSearch=main.querySelector('[data-gfaq-search]'); let faqTopic='all';
 function filterFaq(){const q=(faqSearch?.value||'').trim().toLowerCase();let total=0;main.querySelectorAll('[data-gfaq-group]').forEach(group=>{let count=0;group.querySelectorAll('.gfaq-item').forEach(item=>{const match=(faqTopic==='all'||faqTopic===group.dataset.gfaqGroup)&&(!q||item.textContent.toLowerCase().includes(q));item.hidden=!match;if(match)count++;});group.hidden=count===0;total+=count;});const empty=main.querySelector('.gfaq-empty');if(empty)empty.hidden=total>0;}
 main.querySelectorAll('[data-gfaq-filter]').forEach(button=>button.addEventListener('click',()=>{faqTopic=button.dataset.gfaqFilter;main.querySelectorAll('[data-gfaq-filter]').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});filterFaq();}));
 if(faqSearch){faqSearch.addEventListener('input',filterFaq);filterFaq();}
 main.querySelectorAll('[data-gcases-filter]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.gcasesFilter;main.querySelectorAll('[data-gcases-filter]').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});main.querySelectorAll('[data-gcases-group]').forEach(card=>card.hidden=value!=='all'&&!card.dataset.gcasesGroup.split(/\s+/).includes(value));}));
 // Featured filters deliberately do not affect the independent Latest list.
 const featured=main.querySelector('#featured-insights');
 if(featured){
  const buttons=Array.from(featured.querySelectorAll('.ginsights-filter [data-filter]'));
  const cards=Array.from(featured.querySelectorAll('.ginsights-article-card[data-topic]'));
  const result=featured.querySelector('[data-insights-result-count]');
  function filterInsights(button){const value=button.dataset.filter;let count=0;buttons.forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});cards.forEach(card=>{card.hidden=value!=='all'&&!card.dataset.topic.split(/\s+/).includes(value);if(!card.hidden)count++;});if(result)result.textContent=count+' featured '+(count===1?'article':'articles')+' shown';}
  buttons.forEach(button=>button.addEventListener('click',()=>filterInsights(button)));
  const initialTopic=new URLSearchParams(location.search).get('topic');
  const initialButton=buttons.find(button=>button.dataset.filter===initialTopic)||buttons[0];
  if(initialButton)filterInsights(initialButton);
 }

 // Query context can be inspected visually. It remains entirely local and cannot be submitted.
 if(main.classList.contains('gc-contact-page')){const query=new URLSearchParams(location.search);for(const key of ['request','source','solution','product_direction','product_family','sales_code','product_model','tds_id','route_id','cta_source','cta_location','source_page_type']){const field=main.querySelector('[name="'+key+'"]');if(field&&query.has(key))field.value=query.get(key);}
 const notice=main.querySelector('[data-gcv2-context-notice]');const summary=main.querySelector('[data-gcv2-context-summary]');const parts=['request','product','solution','route_id','tds_id'].filter(key=>query.has(key)&&query.get(key).trim()).map(key=>key+'='+query.get(key).slice(0,120));if(notice&&summary){summary.textContent=parts.join(' · ');notice.hidden=!parts.length;}
 const request=main.querySelector('select[name="dropdown"]');const labels={'sample':'Request a Sample','technical-data':'Request Technical Data','quote':'Request a Quote','technical-team':'Talk to Technical Team'};if(request&&labels[query.get('request')])Array.from(request.options).forEach(o=>o.selected=o.textContent.trim()===labels[query.get('request')]);
 }
})();
