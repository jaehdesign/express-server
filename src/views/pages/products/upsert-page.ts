import type { Animal } from '../../../models/animal.type';
import { BasePage } from '../base-page.js';
import createDebug from 'debug';

const debug = createDebug('demo:views:upsert-products-page');
debug('Loaded module');

const html = String.raw;

type PageContent = {
    mainTitle: string;
    mainContent: Animal | null;
    script?: string;
};

export class UpsertProductsPage extends BasePage {
    constructor(protected title = 'Animals | Demo Products') {
        super(title);
    }

    private renderFormItems = (item: Animal) => {
        return html`
            <fieldset>
                <label class="input">
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder=" "
                        required
                        ${item.name && `value="${item.name}"`}
                        ${item.name && 'readonly'}
                    />
                    <span>Nombre:</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="sciName"
                        name="sciName"
                        placeholder=" "
                        ${item.sciName && `value="${item.sciName}"`}
                    />
                    <span>Nombre científico:</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="englishName"
                        name="englishName"
                        placeholder=" "
                        ${item.englishName && `value="${item.englishName}"`}
                    />
                    <span>Nombre en inglés:</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="group"
                        name="group"
                        placeholder=" "
                        ${item.group && `value="${item.group}"`}
                    />
                    <span>Grupo (e.g. Mamíferos, Aves...):</span>
                </label>
            </fieldset>
            <fieldset>
                <label class="input">
                    <input
                        type="text"
                        id="image"
                        name="image"
                        placeholder=" "
                        ${item.image && `value="${item.image}"`}
                        required
                    />
                    <span>Url de la imagen:</span>
                </label>
            </fieldset>
            <fieldset>
                <label class="input">
                    <input
                        type="text"
                        id="diet"
                        name="diet"
                        placeholder=" "
                        ${item.diet && `value="${item.diet}"`}
                    />
                    <span>Dieta (Carnívoro, Hervívoro...):</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="lifestyle"
                        name="lifestyle"
                        placeholder=" "
                        ${item.lifestyle && `value="${item.lifestyle}"`}
                    />
                    <span>Estilo de vida (Diurno, Nocturno):</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder=" "
                        ${item.location && `value="${item.location}"`}
                    />
                    <span>Localización:</span>
                </label>
                <label class="input">
                    <input
                        type="text"
                        id="slogan"
                        name="slogan"
                        placeholder=" "
                        ${item.slogan && `value="${item.slogan}"`}
                    />
                    <span>Lema:</span>
                </label>
            </fieldset>
        `;
    };

    override renderMain({ mainTitle, mainContent }: PageContent) {
        debug('Iniciando renderMain');

        if (!mainContent) {
            mainContent = {
                id: '',
                name: '',
                sciName: '',
                englishName: '',
                group: '',
                image: '',
                diet: '',
                lifestyle: '',
                location: '',
                slogan: '',
            };
        }
        const action = mainContent.name ? 'update/' + mainContent.id : 'create';
        // const method = 'PUT/PATCH/DELETE' NO ES VÁLIDO EN HTML - se toma como GET;
        const method = 'POST';
        const textButton = mainContent.name ? 'Actualizar' : 'Crear';
        return html`
            <main>
                <section>
                    <a href="/products">
                        <h2 class="h3">${mainTitle}</h2>
                    </a>
                    <div>
                    <form action="/products/${action}" method="${method}">
                        ${this.renderFormItems(mainContent)}
                        <fieldset>
                            <button type="submit">${textButton}</button>
                        </fieldset>
                    </form>
                </section>
            </main>
        `;
    }

    override render(info?: Partial<PageContent>) {
        debug('Iniciando render');
        if (!info) {
            info = {
                mainTitle: 'Crear un nuevo animal',
                mainContent: null,
            };
        } else {
            info.mainTitle = `Modificar datos del ${info.mainContent?.name}`;
            info.mainContent = info.mainContent as Animal;
            info.script = '/form.js';
        }
        return super.render(info);
    }
}
